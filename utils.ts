import { TaskStructureTemplate, TaskGroup, Subtask, ProjectStatus, Project } from './types';

// Task Template Definitions
const RAW_SINGLE_TASKS: TaskStructureTemplate = {
    "Song Demo": ["Demo", "Super Demo", "Master"],
    "Music Video Production": ["Find Director", "Brief", "Pre-Production", "Shooting", "Post-Production", "Cutting and Color Check", "Audio Checking"],
    "Songcode Request": ["Production Fee Form", "Songcode Form", "Lyrics.docx"],
    "Song Registration": {
        "Documents": ["Registration Form", "Shelf Form", "Lyrics .txt"],
        "Audio": ["Multitrack (MLT)", "Full Mix (F)", "Instrumental (B)", "MinusOne (M)", "ACapella (V)", "Tiktok Cut", "Ringtone", "Ring Back Tone"],
        "Artwork": ["Banner", "Single Cover", "Streaming Profile", "Spotify Canvas"]
    },
    "VDO Registration": {
        "Teaser": ["Teaser"],
        "MV": ["Download", "NoSubNoPlatform", "Clean"],
        "Text": ["Teaser", "MV"],
        "AW": ["BHS", "Thumbnail"],
        "MV Release": ["Thumbnail", "Title Desc", "Subtitles", "Debug Sharing"]
    }
};

const RAW_ALBUM_TASKS: TaskStructureTemplate = {
    "Song Demo": ["Demo", "Super Demo", "Master"],
    "Songcode Request": ["Production Fee Form", "Songcode Form", "Lyrics.docx"],
    "Song Registration": {
        "Documents": ["Songlist", "Registration Form", "Shelf Form", "Lyrics .txt"],
        "Audio": ["Multitrack (MLT)", "Full Mix (F)", "Instrumental (B)", "MinusOne (M)", "ACapella (V)", "Tiktok Cut", "Ringtone", "Ring Back Tone"],
        "Artwork": ["Banner", "Single Cover", "Streaming Profile", "Spotify Canvas"]
    }
};

const RAW_LIVE_SESSION_TASKS: TaskStructureTemplate = {
    "VDO": {
        "Checking": ["Cutting", "Color", "Sound"],
        "Details": ["Thumbnail", "Title/Description", "Sharing Debugging"]
    }
};

export const createTaskStructure = (rawTasks: TaskStructureTemplate, dueDate: string): TaskGroup[] => {
    const structuredTasks: TaskGroup[] = [];
    
    for (const [taskTitle, content] of Object.entries(rawTasks)) {
        const subtasks: Subtask[] = [];
        
        if (Array.isArray(content)) {
            content.forEach(name => {
                subtasks.push({
                    name, 
                    assignee: "", 
                    status: "To do", 
                    dueDate: dueDate,
                    remark: "" 
                });
            });
        } else if (typeof content === 'object' && content !== null) {
            for (const [subTitle, items] of Object.entries(content)) {
                (items as string[]).forEach(name => {
                    subtasks.push({
                        name: `${subTitle}: ${name}`, 
                        assignee: "", 
                        status: "To do", 
                        dueDate: dueDate,
                        remark: "" 
                    });
                });
            }
        }
        structuredTasks.push({ 
            title: taskTitle, 
            subtasks: subtasks,
            status: 'To do', 
            dueDate: dueDate
        });
    }
    return structuredTasks;
};

export const getTaskTemplate = (type: string) => {
    switch (type) {
        case 'Album': return RAW_ALBUM_TASKS;
        case 'Live Session': return RAW_LIVE_SESSION_TASKS;
        case 'Single':
        default: return RAW_SINGLE_TASKS;
    }
};

export const calculateDueDateTime = (releaseDateStr: string): string => {
    if (!releaseDateStr) return "";
    const releaseDate = new Date(releaseDateStr + 'T00:00:00'); 
    releaseDate.setDate(releaseDate.getDate() - 28); // Subtract 28 days (4 weeks)
    
    const yyyy = releaseDate.getFullYear();
    const mm = String(releaseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(releaseDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const getDeadlineColor = (releaseDateStr: string): string => {
    if (!releaseDateStr) return 'bg-transparent';
    
    const releaseDate = new Date(releaseDateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    if (diffDays <= 7) return 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]';
    if (diffDays <= 14) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]';
    return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]';
};

export const getStatusColorClass = (status: string): string => {
    switch (status) {
        case 'Done': return 'bg-green-700/80 text-white border-green-600/50';
        case 'In progress': return 'bg-yellow-700/80 text-white border-yellow-600/50';
        case 'To do': return 'bg-gray-600/50 text-white border-gray-700/50';
        case 'On Hold': return 'bg-red-700/80 text-white border-red-600/50';
        default: return 'bg-gray-600/50 text-white border-gray-700/50';
    }
};

export const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    return dateStr.split('-').reverse().join('-');
};

// --- New Helpers for Views ---

export interface FlattenedTask {
    id: string; // combo of project id and task indices
    projectId: string;
    projectName: string;
    taskName: string;
    status: ProjectStatus;
    dueDate: string;
    assignee: string;
    type: 'Project' | 'TaskGroup' | 'Subtask';
}

export const getAllTasksFlattened = (projects: Project[]): FlattenedTask[] => {
    const allTasks: FlattenedTask[] = [];

    projects.forEach(project => {
        // Add Project itself as a milestone
        allTasks.push({
            id: `prj-${project.id}`,
            projectId: project.id!,
            projectName: project.projectName,
            taskName: `🚀 RELEASE: ${project.projectName}`,
            status: project.status,
            dueDate: project.releaseDate,
            assignee: project.artist,
            type: 'Project'
        });

        // Add Subtasks
        if (project.tasks) {
            project.tasks.forEach((group, gIndex) => {
                group.subtasks.forEach((sub, sIndex) => {
                    if (sub.dueDate) {
                        allTasks.push({
                            id: `sub-${project.id}-${gIndex}-${sIndex}`,
                            projectId: project.id!,
                            projectName: project.projectName,
                            taskName: sub.name,
                            status: sub.status,
                            dueDate: sub.dueDate,
                            assignee: sub.assignee,
                            type: 'Subtask'
                        });
                    }
                });
            });
        }
    });

    return allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};