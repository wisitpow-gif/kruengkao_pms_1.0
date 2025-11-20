import React, { useState } from 'react';
import { addProject } from '../services/projectService';

interface ProjectFormProps {
    userId: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ userId }) => {
    const [projectName, setProjectName] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [artist, setArtist] = useState('');
    const [label, setLabel] = useState('');
    const [projectType, setProjectType] = useState('Single');
    const [statusMsg, setStatusMsg] = useState('');

    const handleSubmit = async () => {
        if (!projectName || !releaseDate || !artist || !label) {
            setStatusMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
            setTimeout(() => setStatusMsg(''), 3000);
            return;
        }

        try {
            await addProject(userId, {
                projectName,
                releaseDate,
                artist,
                label,
                projectType
            });
            setStatusMsg('เพิ่มโปรเจกต์สำเร็จ!');
            setProjectName('');
            setReleaseDate('');
            setArtist('');
            setLabel('');
        } catch (error) {
            console.error(error);
            setStatusMsg('เกิดข้อผิดพลาด');
        } finally {
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    return (
        <div className="bg-[#1f283e] p-4 rounded-xl shadow-xl mb-6">
            <h2 className="text-xl font-semibold mb-3 text-white">เพิ่มโปรเจกต์ใหม่</h2>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input 
                        type="text" 
                        placeholder="ชื่อโปรเจกต์" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-white placeholder-gray-500"
                    />
                    <input 
                        type="date" 
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-white"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <input 
                        type="text" 
                        placeholder="ศิลปิน" 
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-white placeholder-gray-500"
                    />
                    <input 
                        type="text" 
                        placeholder="ค่าย (Label)" 
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-white placeholder-gray-500"
                    />
                </div>
                
                <div className="flex space-x-3">
                    <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="flex-1 p-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-white"
                    >
                        <option value="Single">Single</option>
                        <option value="Album">Album</option>
                        <option value="Live Session">Live Session</option>
                    </select>
                    
                    <button 
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition duration-150 shadow-md shadow-indigo-500/50"
                    >
                        เพิ่มโปรเจกต์
                    </button>
                </div>
                <div className={`text-sm h-4 mt-2 ${statusMsg.includes('สำเร็จ') ? 'text-green-400' : 'text-red-400'}`}>
                    {statusMsg}
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;