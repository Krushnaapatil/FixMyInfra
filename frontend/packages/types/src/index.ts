// TODO: generate these from the OpenAPI spec (backend/api-gateway/openapi.yaml)
// via `openapi-typescript` once the contract is finalized in Sprint 0.

export interface Complaint {  id: string;
  category: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  status: 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  authenticityScore?: number;
  departmentId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  departmentId?: string;
}

// Default department directory. Source of truth is
// backend/services/complaint-service/src/routing/departments.js;
// keep the IDs in sync until user-department-service owns departments.
export const DEPARTMENTS: Array<{ id: string; name: string }> = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Roads & Footpaths' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Water & Drainage' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Sanitation' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Street Lighting' }
];

export function departmentNameFor(departmentId?: string | null): string {
  if (!departmentId) return 'Unassigned';
  return DEPARTMENTS.find((entry) => entry.id === departmentId)?.name ?? departmentId;
}
