import React, { useState } from 'react';
import { Project } from '../types';
import { getAllTasksFlattened, getStatusColorClass } from '../utils';

interface CalendarViewProps {
    projects: Project[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ projects }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const allTasks = getAllTasksFlattened(projects);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const renderCells = () => {
        const days = [];
        
        // Padding for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`pad-${i}`} className="bg-[#1f283e]/50 border border-gray-700/30 min-h-[100px]"></div>);
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            const daysTasks = allTasks.filter(t => t.dueDate === dateStr);

            days.push(
                <div key={d} className={`bg-[#1f283e] border border-gray-700/50 min-h-[100px] p-2 flex flex-col gap-1 relative group overflow-hidden hover:bg-gray-800/50 transition ${isToday ? 'ring-1 ring-indigo-500' : ''}`}>
                    <div className={`text-right text-sm font-bold mb-1 ${isToday ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {d}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                        {daysTasks.map((task, i) => {
                            const isProject = task.type === 'Project';
                            const isDone = task.status === 'Done';
                            
                            return (
                                <div 
                                    key={task.id} 
                                    className={`px-1.5 py-1 rounded border-l-2 truncate cursor-pointer text-[10px] md:text-xs flex items-center
                                        ${isProject ? 'bg-indigo-900/30 font-bold text-indigo-200' : 'bg-gray-700/30 text-gray-200'}
                                        ${isDone ? 'opacity-50 line-through' : 'opacity-100'}
                                    `}
                                    style={{ borderLeftColor: task.color }}
                                    title={`${task.projectName}: ${task.taskName} (${task.status})`}
                                >
                                    {task.type !== 'Project' && <span className="text-gray-500 mr-1">[{task.projectName.substring(0,3)}]</span>}
                                    {task.taskName}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a2e] p-4">
            {/* Controls */}
            <div className="flex justify-between items-center mb-4 bg-[#1f283e] p-3 rounded-xl shadow-md">
                <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white p-2">
                    &larr; Prev
                </button>
                <h2 className="text-xl font-bold text-indigo-400">
                    {monthNames[month]} {year}
                </h2>
                <button onClick={handleNextMonth} className="text-gray-400 hover:text-white p-2">
                    Next &rarr;
                </button>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 text-center font-semibold text-gray-500 mb-2 text-sm uppercase">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr overflow-y-auto">
                {renderCells()}
            </div>
        </div>
    );
};

export default CalendarView;