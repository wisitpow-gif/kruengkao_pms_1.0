
import { TaskStructureTemplate, TaskGroup, Subtask, ProjectStatus, Project, TaskConfigItem } from './types';

// Default Offset Constant
const DEFAULT_DAYS_BEFORE = 28;

// Helper to define task config easily
const t = (name: string, days: number = DEFAULT_DAYS_BEFORE): TaskConfigItem => ({ name, daysBeforeRelease: days });

// Task Template Definitions with Defaults
const RAW_SINGLE_TASKS: TaskStructureTemplate = {
    "Song Demo": [
        t("Demo", 60), 
        t("Super Demo", 50), 
        t("Master", 45)
    ],
    "Music Video Production": [
        t("Find Director", 60), 
        t("Brief", 55), 
        t("Pre-Production", 45), 
        t("Shooting", 40), 
        t("Post-Production", 30), 
        t("Cutting and Color Check", 25), 
        t("Audio Checking", 20)
    ],
    "Songcode Request": [
        t("Production Fee Form", 30), 
        t("Songcode Form", 30), 
        t("Lyrics.docx", 30)
    ],
    "Song Registration": {
        "Documents": [
            t("Registration Form", 42), 
            t("Shelf Form", 42), 
            t("Lyrics .txt", 42)
        ],
        "Audio": [
            t("Multitrack (MLT)", 21), 
            t("Full Mix (F)", 21), 
            t("Instrumental (B)", 21), 
            t("MinusOne (M)", 21), 
            t("ACapella (V)", 21), 
            t("Tiktok Cut", 21), 
            t("Ringtone", 21), 
            t("Ring Back Tone", 21)
        ],
        "Artwork": [
            t("Banner", 21), 
            t("Single Cover", 21), 
            t("Streaming Profile", 21), 
            t("Spotify Canvas", 21)
        ]
    },
    "VDO Registration": {
        "Teaser": [t("Teaser", 21)],
        "MV": [
            t("Download", 21), 
            t("NoSubNoPlatform", 21), 
            t("Clean", 21)
        ],
        "Text": [
            t("Teaser", 21), 
            t("MV", 21)
        ],
        "AW": [
            t("BHS", 21), 
            t("Thumbnail", 21)
        ],
        "MV Release": [
            t("Thumbnail", 21), 
            t("Title Desc", 21), 
            t("Subtitles", 21), 
            t("Debug Sharing", 21)
        ]
    }
};

const RAW_ALBUM_TASKS: TaskStructureTemplate = {
    "Song Demo": [t("Demo", 90), t("Super Demo", 75), t("Master", 60)],
    "Songcode Request": [t("Production Fee Form", 45), t("Songcode Form", 45), t("Lyrics.docx", 45)],
    "Song Registration": {
        "Documents": [t("Songlist", 30), t("Registration Form", 30), t("Shelf Form", 30), t("Lyrics .txt", 30)],
        "Audio": [t("Multitrack (MLT)", 30), t("Full Mix (F)", 30), t("Instrumental (B)", 30), t("MinusOne (M)", 30), t("ACapella (V)", 30)],
        "Artwork": [t("Banner", 21), t("Album Cover", 30), t("Streaming Profile", 21), t("Spotify Canvas", 21)]
    }
};

const RAW_LIVE_SESSION_TASKS: TaskStructureTemplate = {
    "VDO": {
        "Checking": [t("Cutting", 20), t("Color", 15), t("Sound", 15)],
        "Details": [t("Thumbnail", 7), t("Title/Description", 7), t("Sharing Debugging", 3)]
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

export const createTaskStructure = (rawTasks: TaskStructureTemplate, releaseDate: string): TaskGroup[] => {
    const structuredTasks: TaskGroup[] = [];
    
    for (const [taskTitle, content] of Object.entries(rawTasks)) {
        const subtasks: Subtask[] = [];
        
        // Helper to process a single item (string or config object)
        const processItem = (item: string | TaskConfigItem, prefix: string = ""): Subtask => {
            let name = "";
            let days = DEFAULT_DAYS_BEFORE;

            if (typeof item === 'string') {
                name = item;
            } else {
                name = item.name;
                days = item.daysBeforeRelease;
            }

            const displayName = prefix ? `${prefix}: ${name}` : name;
            const dueDate = calculateDateFromOffset(releaseDate, days);

            return {
                name: displayName, 
                assignee: "", 
                status: "To do", 
                dueDate: dueDate,
                remark: "" 
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
        
        // Determine Task Group Due Date (Usually the earliest due date of its subtasks for priority, 
        // or we can use the latest. Let's use the earliest to indicate when this group 'starts' needing attention 
        // or simply the earliest deadline within the group).
        // For simplicity in this UI, let's pick the *earliest* deadline in the group so the header shows the most urgent date.
        let groupDueDate = "";
        if (subtasks.length > 0) {
            // Sort temporarily to find earliest
            const sorted = [...subtasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            groupDueDate = sorted[0].dueDate;
        }

        structuredTasks.push({ 
            title: taskTitle, 
            subtasks: subtasks,
            status: 'To do', 
            dueDate: groupDueDate
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

// Legacy export kept for reference, but internal logic updated to use offsets
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
