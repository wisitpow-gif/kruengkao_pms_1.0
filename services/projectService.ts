import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    doc, 
    serverTimestamp, 
    Firestore 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Project, ProjectStatus, TaskGroup } from '../types';
import { calculateDueDateTime, getTaskTemplate, createTaskStructure, formatDateDisplay } from '../utils';

// We need the userId to construct the path as per original code: artifacts/{appId}/users/{userId}/projects
// Since we are using a fixed structure for this demo based on the prompt's auth flow:
const DEFAULT_APP_ID = 'default-app-id';

export const getProjectsCollection = (userId: string) => {
    return collection(db, `artifacts/${DEFAULT_APP_ID}/users/${userId}/projects`);
};

export const subscribeProjects = (userId: string, callback: (projects: Project[]) => void) => {
    const q = query(getProjectsCollection(userId), orderBy("releaseDate", "asc"));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};

export const addProject = async (userId: string, data: {
    projectName: string;
    releaseDate: string;
    artist: string;
    label: string;
    projectType: string;
}) => {
    const dueDateForTasks = calculateDueDateTime(data.releaseDate);
    const rawTemplate = getTaskTemplate(data.projectType);
    const structuredTasks = createTaskStructure(rawTemplate, dueDateForTasks);

    const newProject: Partial<Project> = {
        projectName: data.projectName,
        releaseDate: data.releaseDate,
        releaseDateDisplay: formatDateDisplay(data.releaseDate),
        artist: data.artist,
        label: data.label,
        projectType: data.projectType as any,
        status: 'To do',
        remark: '',
        tasks: structuredTasks,
        createdAt: serverTimestamp() as any
    };

    await addDoc(getProjectsCollection(userId), newProject);
};

export const updateProjectReleaseDate = async (userId: string, projectId: string, currentProject: Project, newReleaseDate: string) => {
    const newDueDateForTasks = calculateDueDateTime(newReleaseDate);
    
    // Deep copy tasks
    const newTasks = JSON.parse(JSON.stringify(currentProject.tasks)) as TaskGroup[];
    
    newTasks.forEach(taskGroup => {
        taskGroup.dueDate = newDueDateForTasks;
        taskGroup.subtasks.forEach(subtask => {
            subtask.dueDate = newDueDateForTasks;
        });
    });

    const projectRef = doc(getProjectsCollection(userId), projectId);
    await updateDoc(projectRef, {
        releaseDate: newReleaseDate,
        releaseDateDisplay: formatDateDisplay(newReleaseDate),
        tasks: newTasks
    });
};

export const updateProjectStatus = async (userId: string, projectId: string, status: ProjectStatus) => {
    const projectRef = doc(getProjectsCollection(userId), projectId);
    await updateDoc(projectRef, { status });
};

export const updateTaskGroupStatus = async (userId: string, projectId: string, currentTasks: TaskGroup[], groupIndex: number, newStatus: ProjectStatus) => {
    const newTasks = [...currentTasks];
    // Update group status
    newTasks[groupIndex] = { ...newTasks[groupIndex], status: newStatus };

    // Rule B: Cascade 'Done' to subtasks
    if (newStatus === 'Done') {
        newTasks[groupIndex].subtasks = newTasks[groupIndex].subtasks.map(st => ({ ...st, status: 'Done' }));
    }

    const projectRef = doc(getProjectsCollection(userId), projectId);
    await updateDoc(projectRef, { tasks: newTasks });
};

export const updateSubtask = async (
    userId: string, 
    projectId: string, 
    currentTasks: TaskGroup[], 
    groupIndex: number, 
    subtaskIndex: number, 
    field: keyof typeof currentTasks[0]['subtasks'][0], 
    value: any
) => {
    // Deep copy to modify
    const newTasks = JSON.parse(JSON.stringify(currentTasks)) as TaskGroup[];
    
    if (newTasks[groupIndex] && newTasks[groupIndex].subtasks[subtaskIndex]) {
        (newTasks[groupIndex].subtasks[subtaskIndex] as any)[field] = value;

        // Rule A: Check and Auto-update Parent Status
        if (field === 'status') {
            const group = newTasks[groupIndex];
            const total = group.subtasks.length;
            const completed = group.subtasks.filter(st => st.status === 'Done').length;
            
            let newGroupStatus = group.status;
            
            if (total > 0 && completed === total) {
                newGroupStatus = 'Done';
            } else if (completed > 0) {
                newGroupStatus = 'In progress';
            } else {
                // Only revert to 'To do' if not manually 'On Hold' (unless we force it by logic, 
                // but let's stick to the original logic: if not done and no progress, it's todo or keeps current)
                if (group.status !== 'On Hold') {
                   newGroupStatus = 'To do';
                }
            }
            
            // Special check: If currently On Hold, only auto-update if it becomes Done
            const isManualOnHold = group.status === 'On Hold' && newGroupStatus !== 'Done';
            
            if (!isManualOnHold) {
                newTasks[groupIndex].status = newGroupStatus;
            }
        }

        const projectRef = doc(getProjectsCollection(userId), projectId);
        await updateDoc(projectRef, { tasks: newTasks });
    }
};