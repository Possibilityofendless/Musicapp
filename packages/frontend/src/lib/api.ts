const API_BASE = import.meta.env.VITE_API_BASE || "/api";

interface CreateProjectPayload {
  title: string;
  description?: string;
  audioUrl: string;
  duration: number;
  performanceDensity: number;
  lyrics?: string;
  autoLyrics?: boolean;
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
  createdAt: string;
  updatedAt: string;
}

interface Scene {
  id: string;
  projectId: string;
  order: number;
  startTime: number;
  endTime: number;
  sceneType: "performance" | "broll";
  prompt: string;
  lipSyncEnabled: boolean;
  lipSyncMethod?: "sora_native" | "post_process";
  lyricExcerpt: string;
  status: string;
  soraClipUrl?: string;
  finalVideoUrl?: string;
  mouthVisibilityScore?: number;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

// Helper function to set auth token
function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

// Helper function to clear auth token
function clearAuthToken(): void {
  localStorage.removeItem("authToken");
}

// Helper to add Authorization only (no content-type for multipart)
function getAuthBearerHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to make authenticated requests
function getAuthHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...getAuthBearerHeader() };
}

export const api = {
  // Auth
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Signup failed");
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Login failed");
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  logout: (): void => {
    clearAuthToken();
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Projects
  uploadAudio: async (file: File): Promise<{ audioUrl: string }> => {
    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch(`${API_BASE}/projects/upload-audio`, {
      method: "POST",
      headers: getAuthBearerHeader(),
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Upload failed: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  },
  listProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.project;
  },

  getProject: async (projectId: string): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateProject: async (
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteProject: async (projectId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  startGeneration: async (projectId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // Scenes
  getScenes: async (projectId: string): Promise<Scene[]> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateScene: async (
    sceneId: string,
    updates: Partial<Scene>
  ): Promise<Scene> => {
    const res = await fetch(`${API_BASE}/scenes/${sceneId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteScene: async (sceneId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/scenes/${sceneId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  reorderScenes: async (
    projectId: string,
    sceneOrder: Array<{ sceneId: string; newOrder: number }>
  ): Promise<Scene[]> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scenes/reorder`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ sceneOrder }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.scenes;
  },

  // Jobs
  getProjectJobs: async (projectId: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/jobs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getJobStatus: async (
    projectId: string,
    jobId: string
  ): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/jobs/${jobId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  retryJob: async (projectId: string, jobId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/jobs/${jobId}/retry`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
