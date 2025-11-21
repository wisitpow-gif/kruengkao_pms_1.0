
import { TaskStructureTemplate, TaskGroup, Subtask, ProjectStatus, Project, TaskConfigItem, FlattenedTask } from './types';

// Default Offset Constant
const DEFAULT_DAYS_BEFORE = 28;
const DEFAULT_DURATION = 7;
const DEFAULT_COLOR = '#6366f1'; // Indigo-500

// Helper to define task config easily
const t = (name: string, days: number, duration: number = DEFAULT_DURATION, color: string = DEFAULT_COLOR): TaskConfigItem => ({ 
    name, 
    daysBeforeRelease: days,
    duration,
    color
});

// Colors
const C_AUDIO = '#8b5cf6'; // Violet
const C_VIDEO = '#ec4899'; // Pink
const C_DOC = '#f59e0b'; // Amber
const C_ARTWORK = '#10b981'; // Emerald
const C_ADMIN = '#64748b'; // Slate

// Task Template Definitions with Defaults
const RAW_SINGLE_TASKS: TaskStructureTemplate = {
    "Song Demo": [
        t("Demo", 60, 14, C_AUDIO), 
        t("Super Demo", 50, 10, C_AUDIO), 
        t("Master", 45, 5, C_AUDIO)
    ],
    "Music Video Production": [
        t("Find Director", 60, 7, C_VIDEO), 
        t("Brief", 55, 5, C_VIDEO), 
        t("Pre-Production", 45, 10, C_VIDEO), 
        t("Shooting", 40, 2, C_VIDEO), 
        t("Post-Production", 30, 10, C_VIDEO), 
        t("Cutting and Color Check", 25, 5, C_VIDEO), 
        t("Audio Checking", 20, 3, C_VIDEO)
    ],
    "Songcode Request": [
        t("Production Fee Form", 30, 3, C_ADMIN), 
        t("Songcode Form", 30, 3, C_ADMIN), 
        t("Lyrics.docx", 30, 1, C_ADMIN)
    ],
    "Song Registration": {
        "Documents": [
            t("Registration Form", 42, 5, C_DOC), 
            t("Shelf Form", 42, 5, C_DOC), 
            t("Lyrics .txt", 42, 1, C_DOC)
        ],
        "Audio": [
            t("Multitrack (MLT)", 21, 2, C_AUDIO), 
            t("Full Mix (F)", 21, 2, C_AUDIO), 
            t("Instrumental (B)", 21, 2, C_AUDIO), 
            t("MinusOne (M)", 21, 2, C_AUDIO), 
            t("ACapella (V)", 21, 2, C_AUDIO), 
            t("Tiktok Cut", 21, 1, C_AUDIO), 
            t("Ringtone", 21, 1, C_AUDIO), 
            t("Ring Back Tone", 21, 1, C_AUDIO)
        ],
        "Artwork": [
            t("Banner", 21, 7, C_ARTWORK), 
            t("Single Cover", 21, 14, C_ARTWORK), 
            t("Streaming Profile", 21, 7, C_ARTWORK), 
            t("Spotify Canvas", 21, 7, C_ARTWORK)
        ]
    },
    "VDO Registration": {
        "Teaser": [t("Teaser", 21, 5, C_VIDEO)],
        "MV": [
            t("Download", 21, 1, C_VIDEO), 
            t("NoSubNoPlatform", 21, 1, C_VIDEO), 
            t("Clean", 21, 1, C_VIDEO)
        ],
        "Text": [
            t("Teaser", 21, 2, C_DOC), 
            t("MV", 21, 2, C_DOC)
        ],
        "AW": [
            t("BHS", 21, 5, C_ARTWORK), 
            t("Thumbnail", 21, 5, C_ARTWORK)
        ],
        "MV Release": [
            t("Thumbnail", 21, 1, C_ARTWORK), 
            t("Title Desc", 21, 2, C_DOC), 
            t("Subtitles", 21, 3, C_DOC), 
            t("Debug Sharing", 21, 1, C_ADMIN)
        ]
    }
};

const RAW_ALBUM_TASKS: TaskStructureTemplate = {
    "Song Demo": [t("Demo", 90, 20, C_AUDIO), t("Super Demo", 75, 15, C_AUDIO), t("Master", 60, 10, C_AUDIO)],
    "Songcode Request": [t("Production Fee Form", 45, 5, C_ADMIN), t("Songcode Form", 45, 5, C_ADMIN), t("Lyrics.docx", 45, 2, C_ADMIN)],
    "Song Registration": {
        "Documents": [t("Songlist", 30, 5, C_DOC), t("Registration Form", 30, 5, C_DOC), t("Shelf Form", 30, 5, C_DOC), t("Lyrics .txt", 30, 2, C_DOC)],
        "Audio": [t("Multitrack (MLT)", 30, 5, C_AUDIO), t("Full Mix (F)", 30, 5, C_AUDIO), t("Instrumental (B)", 30, 5, C_AUDIO), t("MinusOne (M)", 30, 5, C_AUDIO), t("ACapella (V)", 30, 5, C_AUDIO)],
        "Artwork": [t("Banner", 21, 10, C_ARTWORK), t("Album Cover", 30, 20, C_ARTWORK), t("Streaming Profile", 21, 5, C_ARTWORK), t("Spotify Canvas", 21, 10, C_ARTWORK)]
    }
};

const RAW_LIVE_SESSION_TASKS: TaskStructureTemplate = {
    "VDO": {
        "Checking": [t("Cutting", 20, 10, C_VIDEO), t("Color", 15, 5, C_VIDEO), t("Sound", 15, 5, C_AUDIO)],
        "Details": [t("Thumbnail", 7, 3, C_ARTWORK), t("Title/Description", 7, 2, C_DOC), t("Sharing Debugging", 3, 1, C_ADMIN)]
    }
};

// Helper to calculate specific date based on offset
const calculateDateFromOffset = (releaseDateStr: string, daysBefore: number): string => {
    if (!releaseDateStr) return "";
    const releaseDate = new Date(releaseDateStr + 'T00:00:00'); 
    releaseDate.setDate(releaseDate.getDate() - daysBefore); 
    
    const yyyy = releaseDate.getFullYear();
    const mm = String(releaseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(releaseDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Helper to calculate start date from due date and duration
const calculateStartDate = (dueDateStr: string, duration: number): string => {
    if (!dueDateStr) return "";
    const dueDate = new Date(dueDateStr + 'T00:00:00');
    dueDate.setDate(dueDate.getDate() - duration);
    
    const yyyy = dueDate.getFullYear();
    const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dueDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const createTaskStructure = (rawTasks: TaskStructureTemplate, releaseDate: string): TaskGroup[] => {
    const structuredTasks: TaskGroup[] = [];
    
    for (const [taskTitle, content] of Object.entries(rawTasks)) {
        const subtasks: Subtask[] = [];
        
        // Helper to process a single item
        const processItem = (item: string | TaskConfigItem, prefix: string = ""): Subtask => {
            let name = "";
            let days = DEFAULT_DAYS_BEFORE;
            let duration = DEFAULT_DURATION;
            let color = DEFAULT_COLOR;

            if (typeof item === 'string') {
                name = item;
            } else {
                name = item.name;
                days = item.daysBeforeRelease;
                duration = item.duration;
                color = item.color;
            }

            const displayName = prefix ? `${prefix}: ${name}` : name;
            const dueDate = calculateDateFromOffset(releaseDate, days);
            const startDate = calculateStartDate(dueDate, duration);

            return {
                name: displayName, 
                assignee: "", 
                status: "To do", 
                startDate: startDate,
                dueDate: dueDate,
                remark: "",
                color: color
            };
        };

        if (Array.isArray(content)) {
            content.forEach(item => {
                subtasks.push(processItem(item));
            });
        } else if (typeof content === 'object' && content !== null) {
            for (const [subTitle, items] of Object.entries(content)) {
                (items as (string | TaskConfigItem)[]).forEach(item => {
                    subtasks.push(processItem(item, subTitle));
                });
            }
        }
        
        // Determine Task Group Dates
        let groupDueDate = "";
        let groupStartDate = "";
        
        if (subtasks.length > 0) {
            // Sort to find ranges
            const byDue = [...subtasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            const byStart = [...subtasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            
            groupDueDate = byDue[0].dueDate; // Earliest deadline
            groupStartDate = byStart[0].startDate; // Earliest start
        }

        structuredTasks.push({ 
            title: taskTitle, 
            subtasks: subtasks,
            status: 'To do', 
            dueDate: groupDueDate,
            startDate: groupStartDate
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
    return calculateDateFromOffset(releaseDateStr, DEFAULT_DAYS_BEFORE);
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
    // Ensure we handle potentially empty or invalid strings gracefully
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// --- New Helpers for Views ---

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
            type: 'Project',
            color: '#4f46e5' // Indigo-600
        } as FlattenedTask);

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
                            startDate: sub.startDate,
                            dueDate: sub.dueDate,
                            assignee: sub.assignee,
                            type: 'Subtask',
                            color: sub.color || DEFAULT_COLOR
                        } as FlattenedTask);
                    }
                });
            });
        }
    });

    return allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};
