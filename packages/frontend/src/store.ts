import { create } from "zustand";
import { api } from "./lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface GeneratedVideo {
  id: string;
  projectId: string;
  type: 'final' | 'intermediate' | 'sora_raw' | 'lip_synced';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  version: number;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number;
  performanceDensity: number;
  status: string;
  progress: number;
  videos?: GeneratedVideo[];
}

interface Scene {
  id: string;
  projectId: string;
  order: number;
  sceneType: "performance" | "broll";
  lyricExcerpt: string;
  status: string;
  soraClipUrl?: string;
}

interface Job {
  id: string;
  projectId: string;
  type: string;
  status: string;
  error?: string;
  resultData?: any;
  createdAt: string;
}

interface AppStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Project state
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;

  // Scene state
  scenes: Scene[];

  // Job state
  jobs: Job[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Auth actions
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (payload: any) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  stitchVideo: (projectId: string) => Promise<void>;
  loadScenes: (projectId: string) => Promise<void>;
  updateScene: (sceneId: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  reorderScenes: (projectId: string, sceneOrder: Array<{ sceneId: string; newOrder: number }>) => Promise<void>;
  loadProjectJobs: (projectId: string) => Promise<void>;
  getJobStatus: (projectId: string, jobId: string) => Promise<Job>;
  retryJob: (projectId: string, jobId: string) => Promise<void>;
  generateVideo: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppStore>((set) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  authLoading: true,

  // Project state
  projects: [],
  currentProjectId: null,
  currentProject: null,

  // Scene state
  scenes: [],

  // Job state
  jobs: [],

  // UI state
  isLoading: false,
  error: null,

  // Auth actions
  signup: async (email, password, name) => {
    set({ authLoading: true, error: null });
    try {
      const response = await api.signup(email, password, name);
      set({
        user: response.user,
        isAuthenticated: true,
        authLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      set({ error: message, authLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ authLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        authLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      set({ error: message, authLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({
      user: null,
      isAuthenticated: false,
      projects: [],
      scenes: [],
      jobs: [],
      currentProject: null,
      currentProjectId: null,
    });
  },

  checkAuth: async () => {
    set({ authLoading: true });
    try {
      const user = await api.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        authLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        authLoading: false,
      });
    }
  },

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.listProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load projects";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createProject: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.createProject(payload);
      set((state) => ({
        projects: [...state.projects, project],
        currentProjectId: project.id,
        currentProject: project,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  loadProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.getProject(projectId);
      set({
        currentProject: project,
        currentProjectId: projectId,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load project";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      const project = await api.updateProject(projectId, updates);
      set((state) => ({
        currentProject: {
          ...state.currentProject!,
          ...project,
        },
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, ...project } : p
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update project";
      set({ error: message });
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await api.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
        currentProject: state.currentProjectId === projectId ? null : state.currentProject,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project";
      set({ error: message });
      throw error;
    }
  },

  stitchVideo: async (projectId) => {
    try {
      await api.stitchVideo(projectId);
      // Reload project to get updated status
      const project = await api.getProject(projectId);
      set((state) => ({
        currentProject: project,
        projects: state.projects.map((p) =>
          p.id === projectId ? project : p
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to stitch video";
      set({ error: message });
      throw error;
    }
  },

  loadScenes: async (projectId) => {
    try {
      const scenes = await api.getScenes(projectId);
      set({ scenes });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load scenes";
      set({ error: message });
      throw error;
    }
  },

  updateScene: async (sceneId, updates) => {
    try {
      const scene = await api.updateScene(sceneId, updates);
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, ...scene } : s
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update scene";
      set({ error: message });
      throw error;
    }
  },

  deleteScene: async (sceneId) => {
    try {
      await api.deleteScene(sceneId);
      set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== sceneId),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete scene";
      set({ error: message });
      throw error;
    }
  },

  reorderScenes: async (projectId, sceneOrder) => {
    try {
      const scenes = await api.reorderScenes(projectId, sceneOrder);
      set({ scenes });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reorder scenes";
      set({ error: message });
      throw error;
    }
  },

  loadProjectJobs: async (projectId) => {
    try {
      const jobs = await api.getProjectJobs(projectId);
      set({ jobs });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load jobs";
      set({ error: message });
      throw error;
    }
  },

  getJobStatus: async (projectId, jobId) => {
    try {
      const job = await api.getJobStatus(projectId, jobId);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === jobId ? job : j)),
      }));
      return job;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get job status";
      set({ error: message });
      throw error;
    }
  },

  retryJob: async (projectId, jobId) => {
    try {
      await api.retryJob(projectId, jobId);
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== jobId),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retry job";
      set({ error: message });
      throw error;
    }
  },

  generateVideo: async (projectId) => {
    try {
      await api.startGeneration(projectId);
      // Reload project to get updated status
      const updatedProject = await api.getProject(projectId);
      set((state) => ({
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start video generation";
      set({ error: message });
      throw error;
    }
  },

  setCurrentProject: (projectId) => {
    set({ currentProjectId: projectId });
  },

  clearError: () => {
    set({ error: null });
  },
}));
