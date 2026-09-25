import axios from 'axios';
import type { Complaint, User } from '@fixmyinfra/types';

const tokenStorageKey = 'fixmyinfra_token';
const userStorageKey = 'fixmyinfra_user';

function clearStoredSession() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}

export interface CreateComplaintPayload {
  category: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
}

// Kept in step with MAX_UPLOAD_BYTES in complaint-service so the UI can reject
// an oversized photo before spending the upload.
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic'
] as const;

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // The API is the source of truth for token validity. Clear a rejected or
    // expired session so the next protected route sends the user to login
    // instead of leaving the UI stuck on an authorization error.
    clearStoredSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.replace('/login?session=expired');
    }

    return Promise.reject(error);
  }
);

export async function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  const { data } = await apiClient.post<Complaint>('/complaints', payload);
  return data;
}

// Step 1 of the two-step evidence flow: upload the photo, then pass the
// returned URL to createComplaint. Content-Type is intentionally left unset so
// the browser can add the multipart boundary itself.
export async function uploadComplaintPhoto(photo: File): Promise<string> {
  const body = new FormData();
  body.append('photo', photo);
  const { data } = await apiClient.post<{ imageUrl: string }>('/complaints/attachments', body);
  return data.imageUrl;
}

export async function getComplaints(): Promise<Complaint[]> {
  const { data } = await apiClient.get<{ complaints: Complaint[] }>('/complaints');
  return data.complaints;
}

export async function getAssignedComplaints(): Promise<Complaint[]> {
  const { data } = await apiClient.get<{ complaints: Complaint[] }>('/complaints/assigned');
  return data.complaints;
}

export async function getComplaintById(id: string): Promise<Complaint> {
  const { data } = await apiClient.get<Complaint>(`/complaints/${id}`);
  return data;
}

export async function updateComplaintStatus(id: string, status: Complaint['status']): Promise<Complaint> {
  const { data } = await apiClient.patch<Complaint>(`/complaints/${id}/status`, { status });
  return data;
}

export async function assignUserDepartment(userId: string, departmentId: string | null): Promise<User> {
  const { data } = await apiClient.patch<User>(`/auth/users/${userId}/department`, { departmentId });
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<{ users: User[] }>('/auth/users');
  return data.users;
}
