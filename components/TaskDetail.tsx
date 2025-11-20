import React from 'react';
import { Project, ProjectStatus, TaskGroup } from '../types';
import { getStatusColorClass, formatDateDisplay } from '../utils';
import { updateProjectStatus, updateTaskGroupStatus, updateSubtask } from '../services/projectService';

interface TaskDetailProps {
    userId: string;
    project: Project | undefined;
}

const STATUS_OPTIONS: ProjectStatus[] = ['To do', 'In progress', 'Done', 'On Hold'];

const TaskDetail: React.FC<TaskDetailProps> = ({ userId, project }) => {
    if (!project) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-500">เลือกโปรเจกต์เพื่อดูรายละเอียด</h2>
                <p className="text-gray-600">โปรเจกต์ที่เพิ่มใหม่จะปรากฏที่นี่</p>
            </div>
        );
    }

    const handleProjectStatusChange = (val: string) => {
        updateProjectStatus(userId, project.id!, val as ProjectStatus);
    };

    const handleTaskGroupStatusChange = (groupIndex: number, val: string) => {
        updateTaskGroupStatus(userId, project.id!, project.tasks, groupIndex, val as ProjectStatus);
    };

    const handleSubtaskChange = (groupIndex: number, subtaskIndex: number, field: string, val: any) => {
        updateSubtask(userId, project.id!, project.tasks, groupIndex, subtaskIndex, field as any, val);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-100 truncate pr-4">{project.projectName}</h2>
                <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-gray-400 text-sm hidden md:inline">สถานะโปรเจกต์:</span>
                    <select 
                        value={project.status}
                        onChange={(e) => handleProjectStatusChange(e.target.value)}
                        className={`p-2 rounded border text-sm font-medium ${getStatusColorClass(project.status)}`}
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1f283e]">{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
                {project.tasks?.map((taskGroup: TaskGroup, gIndex: number) => {
                    const taskGroupStatusClass = getStatusColorClass(taskGroup.status);

                    return (
                        <div key={gIndex} className="border-b border-gray-700 pb-3">
                            {/* Group Header */}
                            <div className="flex items-center justify-between mb-2 sticky top-0 bg-[#1f283e] z-10 py-2">
                                <h3 className="text-lg font-semibold text-indigo-400 flex flex-col md:flex-row md:items-center">
                                    {taskGroup.title} 
                                    <span className="ml-0 md:ml-2 text-xs text-gray-500 font-normal mt-1 md:mt-0">
                                        (กำหนดส่ง: {formatDateDisplay(taskGroup.dueDate)})
                                    </span>
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400 hidden sm:inline">สถานะ Task:</span>
                                    <select 
                                        value={taskGroup.status}
                                        onChange={(e) => handleTaskGroupStatusChange(gIndex, e.target.value)}
                                        className={`p-1 text-xs md:text-sm rounded border ${taskGroupStatusClass}`}
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1f283e]">{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Subtask Table Header */}
                            <div className="grid grid-cols-7 gap-2 items-center text-xs font-semibold uppercase text-gray-500 border-b border-gray-700 pb-2 mb-2">
                                <div className="col-span-2">งานย่อย</div>
                                <div>ผู้รับผิดชอบ</div>
                                <div>สถานะ</div>
                                <div>กำหนดส่ง</div>
                                <div className="col-span-2">หมายเหตุ</div>
                            </div>

                            {/* Subtasks */}
                            <div className="space-y-1">
                                {taskGroup.subtasks.map((subtask, sIndex) => (
                                    <div key={sIndex} className="grid grid-cols-7 gap-2 items-center py-2 border-b border-gray-700/30 text-sm hover:bg-gray-800/50 rounded px-1">
                                        {/* Name */}
                                        <div className="col-span-2 font-light text-gray-300 text-xs md:text-sm">{subtask.name}</div>
                                        
                                        {/* Assignee */}
                                        <div>
                                            <input 
                                                type="text" 
                                                value={subtask.assignee} 
                                                onChange={(e) => handleSubtaskChange(gIndex, sIndex, 'assignee', e.target.value)}
                                                className="w-full bg-gray-800/50 p-1 text-xs md:text-sm rounded border border-gray-700 focus:border-indigo-500 text-gray-300"
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <select 
                                                value={subtask.status}
                                                onChange={(e) => handleSubtaskChange(gIndex, sIndex, 'status', e.target.value)}
                                                className={`w-full p-1 text-xs rounded border ${getStatusColorClass(subtask.status)}`}
                                            >
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1f283e]">{s}</option>)}
                                            </select>
                                        </div>

                                        {/* Due Date */}
                                        <div>
                                            <input 
                                                type="date" 
                                                value={subtask.dueDate || ''}
                                                onChange={(e) => handleSubtaskChange(gIndex, sIndex, 'dueDate', e.target.value)}
                                                className="w-full bg-gray-800/50 p-1 text-xs rounded border border-gray-700 focus:border-indigo-500 text-gray-400"
                                            />
                                        </div>

                                        {/* Remark */}
                                        <div className="col-span-2">
                                            <input 
                                                type="text" 
                                                value={subtask.remark} 
                                                placeholder="เพิ่มหมายเหตุ"
                                                onChange={(e) => handleSubtaskChange(gIndex, sIndex, 'remark', e.target.value)}
                                                className="w-full bg-gray-800/50 p-1 text-xs rounded border border-gray-700 focus:border-indigo-500 text-gray-400 placeholder-gray-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskDetail;