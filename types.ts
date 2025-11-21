
import { Timestamp } from 'firebase/firestore';

export type ProjectStatus = 'To do' | 'In progress' | 'Done' | 'On Hold';
export type ProjectType = 'Single' | 'Album' | 'Live Session';

export interface Subtask {
    name: string;
    assignee: string;
    status: ProjectStatus;
    startDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    remark: string;
    color?: string; // For display purposes
}

export interface TaskGroup {
    title: string;
    subtasks: Subtask[];
    status: ProjectStatus;
    dueDate: string; 
    startDate?: string;
}

export interface Project {
    id?: string;
    projectName: string;
    releaseDate: string; // YYYY-MM-DD
    releaseDateDisplay: string; // DD-MM-YYYY
    artist: string;
    label: string;
    projectType: ProjectType;
    status: ProjectStatus;
    remark: string;
    tasks: TaskGroup[];
    createdAt?: Timestamp;
}

export interface TaskConfigItem {
    name: string;
    daysBeforeRelease: number; // Lead time
    duration: number; // Default duration in days
    color: string; // RGB/Hex code for visual differentiation
}

// Template can be simple strings (legacy/fallback) or Config objects
export interface TaskStructureTemplate {
    [key: string]: (string | TaskConfigItem)[] | { [key: string]: (string | TaskConfigItem)[] };
}

export interface FlattenedTask {
    id: string;
    projectId: string;
    projectName: string;
    taskName: string;
    status: string;
    startDate?: string;
    dueDate: string;
    assignee: string;
    type: 'Project' | 'Subtask';
    color: string;
}
