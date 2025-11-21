import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { getStatusColorClass } from '../utils';

interface GanttViewProps {
    projects: Project[];
}

const GanttView: React.FC<GanttViewProps> = ({ projects }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Generate days array for header
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="h-full flex flex-col bg-[#1a1a2e] p-4 overflow-hidden">
            {/* Controls */}
            <div className="flex justify-between items-center mb-4 bg-[#1f283e] p-3 rounded-xl shadow-md shrink-0">
                <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white p-2">&larr; Prev</button>
                <h2 className="text-xl font-bold text-indigo-400">{monthNames[month]} {year}</h2>
                <button onClick={handleNextMonth} className="text-gray-400 hover:text-white p-2">Next &rarr;</button>
            </div>

            <div className="flex-1 flex overflow-hidden border border-gray-700 rounded-xl bg-[#1f283e]">
                {/* Left Sidebar: Task Names */}
                <div className="w-64 flex-shrink-0 border-r border-gray-700 bg-[#1f283e] overflow-y-auto scrollbar-hide z-10">
                    <div className="h-10 border-b border-gray-700 bg-[#1a1a2e] sticky top-0 flex items-center px-4 font-bold text-gray-400 text-sm">
                        Task Name
                    </div>
                    {projects.map(project => (
                        <div key={project.id}>
                            {/* Project Header */}
                            <div className="bg-indigo-900/20 px-4 py-2 text-sm font-bold text-indigo-300 border-b border-gray-700/50 truncate">
                                {project.projectName}
                            </div>
                            
                            {/* Subtasks */}
                            {project.tasks?.map((group, gIdx) => (
                                <React.Fragment key={gIdx}>
                                    {group.subtasks.map((sub, sIdx) => (
                                        <div key={`${project.id}-${gIdx}-${sIdx}`} className="px-4 py-1.5 text-xs text-gray-400 border-b border-gray-700/30 truncate hover:bg-gray-700/30 h-8 flex items-center">
                                           {sub.name}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Right Side: Timeline */}
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <div className="min-w-max">
                        {/* Header Row: Days */}
                        <div className="flex h-10 border-b border-gray-700 bg-[#1a1a2e] sticky top-0 z-20">
                            {daysArray.map(d => {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                                return (
                                    <div key={d} className={`w-8 shrink-0 flex items-center justify-center text-xs border-r border-gray-700/50 ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
                                        {d}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid Rows */}
                        {projects.map(project => (
                            <div key={`grid-${project.id}`}>
                                {/* Project Row (Empty for now, just spacing) */}
                                <div className="h-[37px] bg-indigo-900/10 border-b border-gray-700/50 w-full flex">
                                    {/* Check if Project Release Date is in this month */}
                                    {daysArray.map(d => {
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                        const isRelease = project.releaseDate === dateStr;
                                        return (
                                            <div key={d} className="w-8 shrink-0 border-r border-gray-700/30 h-full relative flex items-center justify-center">
                                                {isRelease && (
                                                    <div className="absolute z-10" title={`Release: ${project.projectName}`}>
                                                        <div className="w-4 h-4 bg-indigo-500 rotate-45 transform"></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Subtasks Rows */}
                                {project.tasks?.map((group, gIdx) => (
                                    <React.Fragment key={`grid-group-${gIdx}`}>
                                        {group.subtasks.map((sub, sIdx) => (
                                            <div key={`${project.id}-${gIdx}-${sIdx}`} className="flex h-8 hover:bg-gray-700/20">
                                                {daysArray.map(d => {
                                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                    const isDue = sub.dueDate === dateStr;
                                                    
                                                    // Simple visualization: Just the due date block for now
                                                    // Since we don't have start dates, we can't draw bars accurately.
                                                    // We will draw a small pill if due.
                                                    
                                                    return (
                                                        <div key={d} className={`w-8 shrink-0 border-r border-gray-700/20 border-b border-gray-700/20 h-full flex items-center justify-center relative ${isDue ? 'bg-gray-700/30' : ''}`}>
                                                            {isDue && (
                                                                <div 
                                                                    className={`w-6 h-4 rounded-sm shadow-sm cursor-help ${getStatusColorClass(sub.status).split(' ')[0]}`}
                                                                    title={`${sub.name} (Due: ${sub.dueDate})`}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttView;