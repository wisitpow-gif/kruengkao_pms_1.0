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
    dueDate: string;
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

export interface TaskStructureTemplate {
    [key: string]: string[] | { [key: string]: string[] };
}