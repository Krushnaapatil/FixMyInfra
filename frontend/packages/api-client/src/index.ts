import axios from 'axios';
import type { Complaint, User } from '@fixmyinfra/types';

export interface CreateComplaintPayload {
  category: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
}

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fixmyinfra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  const { data } = await apiClient.post<Complaint>('/complaints', payload);
  return data;
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
