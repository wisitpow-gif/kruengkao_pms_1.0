
import { Timestamp } from 'firebase/firestore';

export type ProjectStatus = 'To do' | 'In progress' | 'Done' | 'On Hold';
export type ProjectType = 'Single' | 'Album' | 'Live Session';

export interface Subtask {
    name: string;
    assignee: string;
    status: ProjectStatus;
    dueDate: string;
    remark: string;
}

export interface TaskGroup {
    title: string;
    subtasks: Subtask[];
    status: ProjectStatus;
    dueDate: string; // Usually the earliest due date of subtasks or the latest
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
    daysBeforeRelease: number; // Default configuration for this task
}

// Template can be simple strings (legacy/fallback) or Config objects
export interface TaskStructureTemplate {
    [key: string]: (string | TaskConfigItem)[] | { [key: string]: (string | TaskConfigItem)[] };
}
