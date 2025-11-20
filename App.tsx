import React, { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth } from './firebaseConfig';
import { subscribeProjects } from './services/projectService';
import { Project } from './types';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import TaskDetail from './components/TaskDetail';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Authentication
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                // Auto sign-in anonymously as per original requirement/flow
                signInAnonymously(auth).catch(err => {
                    console.error("Auth Error:", err);
                    // Extract the error code/message more clearly
                    const errorMessage = err.code ? `${err.code}: ${err.message}` : err.message;
                    setError(errorMessage);
                    setLoading(false);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Subscribe to Projects
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeProjects(user.uid, (fetchedProjects) => {
            setProjects(fetchedProjects);
            
            // If no project selected, select first
            if (fetchedProjects.length > 0 && !selectedProjectId) {
                setSelectedProjectId(fetchedProjects[0].id!);
            } 
            // If selected project was deleted, revert to first or null
            else if (selectedProjectId && !fetchedProjects.find(p => p.id === selectedProjectId)) {
                setSelectedProjectId(fetchedProjects.length > 0 ? fetchedProjects[0].id! : null);
            }
        });

        return () => unsubscribe();
    }, [user, selectedProjectId]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (loading) {
        return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-indigo-400">Loading KruengKao PMS...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center text-red-500 p-4 text-center">
                <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
                <p className="mb-4 max-w-lg break-words">{error}</p>
                
                {/* Specific guidance for auth/configuration-not-found */}
                {(error.includes("auth/configuration-not-found") || error.includes("auth/admin-restricted-operation")) && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-gray-300 text-sm max-w-md text-left border border-gray-700">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Setup Required</h3>
                        <p className="mb-3">
                            This error usually indicates that <strong>Anonymous Authentication</strong> is not enabled in your Firebase project.
                        </p>
                        <p className="mb-2 font-medium text-white">How to fix:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-1">
                            <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Firebase Console</a>.</li>
                            <li>Select your project (<strong>kruengkao-pms</strong>).</li>
                            <li>Navigate to <strong>Build</strong> &gt; <strong>Authentication</strong>.</li>
                            <li>Click the <strong>Sign-in method</strong> tab.</li>
                            <li>Click on <strong>Anonymous</strong>.</li>
                            <li>Toggle <strong>Enable</strong> and click <strong>Save</strong>.</li>
                            <li>Refresh this page.</li>
                        </ol>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-gray-200 flex flex-col font-inter">
            {/* Header */}
            <header className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-[#1f283e] shadow-lg shrink-0">
                <h1 className="text-xl md:text-2xl font-extrabold text-indigo-400 tracking-tight">
                    KruengKao <span className="text-gray-400 font-light">PMS</span>
                </h1>
                <div className="flex items-center space-x-4 text-xs md:text-sm">
                    <span className="text-gray-400 hidden sm:inline">มุมมอง:</span>
                    <div className="flex space-x-1">
                        <button className="font-bold text-white bg-indigo-600 px-3 py-1 rounded-md shadow-lg">Project</button>
                        <button className="text-gray-400 hover:text-indigo-400 px-3 py-1 transition">Gantt</button>
                        <button className="text-gray-400 hover:text-indigo-400 px-3 py-1 transition">Calendar</button>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono hidden md:inline">ID: {user?.uid.substring(0, 6)}...</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-6 grid lg:grid-cols-3 gap-6 h-[calc(100vh-4rem)] overflow-hidden">
                
                {/* Left Panel: Form & List */}
                <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-hidden">
                    <ProjectForm userId={user!.uid} />
                    <ProjectList 
                        userId={user!.uid} 
                        projects={projects} 
                        selectedProjectId={selectedProjectId}
                        onSelectProject={setSelectedProjectId}
                    />
                </div>

                {/* Right Panel: Details */}
                <div className="lg:col-span-2 bg-[#1f283e] p-4 md:p-6 rounded-xl shadow-xl overflow-hidden h-full border border-gray-700/30">
                    <TaskDetail userId={user!.uid} project={selectedProject} />
                </div>

            </main>
        </div>
    );
};

export default App;