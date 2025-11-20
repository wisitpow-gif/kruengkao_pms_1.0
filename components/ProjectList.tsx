import React from 'react';
import { Project } from '../types';
import { getDeadlineColor, getStatusColorClass } from '../utils';
import { updateProjectReleaseDate } from '../services/projectService';

interface ProjectListProps {
    userId: string;
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ userId, projects, selectedProjectId, onSelectProject }) => {
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, project: Project) => {
        e.stopPropagation(); // Prevent row selection
        updateProjectReleaseDate(userId, project.id!, project, e.target.value);
    };

    return (
        <div className="bg-[#1f283e] p-4 rounded-xl shadow-xl flex-1 overflow-hidden flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-3 text-white">Projects</h2>
            
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-2 font-bold uppercase text-[10px] md:text-xs text-gray-400 border-b border-gray-600/50 pb-2 mb-2">
                <div></div>
                <div className="truncate">วันปล่อย</div>
                <div className="truncate">ชื่อโปรเจกต์</div>
                <div className="truncate">ศิลปิน</div>
                <div className="truncate">ค่าย</div> 
                <div className="truncate">ประเภท</div>
                <div className="truncate">สถานะ</div>
                <div className="truncate">หมายเหตุ</div>
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto flex-1 pr-1">
                {projects.length === 0 ? (
                     <div className="p-4 text-center text-gray-400">
                        ไม่พบโปรเจกต์. ลองเพิ่มโปรเจกต์ใหม่!
                    </div>
                ) : (
                    projects.map(project => {
                        const isSelected = project.id === selectedProjectId;
                        const deadlineColor = getDeadlineColor(project.releaseDate);
                        const statusColor = getStatusColorClass(project.status);

                        return (
                            <div 
                                key={project.id}
                                onClick={() => onSelectProject(project.id!)}
                                className={`grid grid-cols-8 gap-2 items-center py-2 px-3 text-xs md:text-sm cursor-pointer transition duration-150 border-b border-gray-700/30
                                    ${isSelected ? 'bg-indigo-600/20 hover:bg-indigo-600/30' : 'bg-transparent hover:bg-gray-700/40'}
                                `}
                            >
                                {/* Color Indicator */}
                                <div className={`h-full w-1.5 ${deadlineColor} rounded-sm justify-self-start`}></div>
                                
                                {/* Editable Date */}
                                <div className="truncate">
                                    <input 
                                        type="date" 
                                        value={project.releaseDate || ''}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleDateChange(e, project)}
                                        className="w-full bg-transparent p-0 text-xs border-none focus:ring-0 cursor-pointer text-gray-300 hover:text-white"
                                    />
                                </div>

                                <div className="truncate text-white font-medium">{project.projectName || 'N/A'}</div>
                                <div className="truncate text-gray-300">{project.artist || 'N/A'}</div>
                                <div className="truncate text-gray-400">{project.label || 'N/A'}</div> 
                                <div className="text-gray-400">{project.projectType || 'Single'}</div>
                                
                                <div>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${statusColor} whitespace-nowrap`}>
                                        {project.status || 'To do'}
                                    </span>
                                </div>
                                <div className="truncate text-gray-500">{project.remark || '-'}</div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProjectList;