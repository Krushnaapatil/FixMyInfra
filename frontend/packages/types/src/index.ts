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
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  departmentId?: string;
}

// Issue catalogue. Source of truth is
// backend/services/complaint-service/src/routing/departments.js;
// backend/services/complaint-service/test/catalog.test.js fails if the two
// ever drift apart. The dropdown, map pin colours and card thumbnails are all
// derived from this list rather than hardcoded per component.
export interface Department {
  id: string;
  name: string;
  color: string;
  categories: string[];
}

export const FALLBACK_CATEGORY_COLOR = '#64748b';

export const DEPARTMENTS: Department[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Roads & Footpaths', color: '#e23529', categories: ['Road damage'] },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Water & Drainage', color: '#e9b406', categories: ['Water and drainage'] },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Sanitation', color: '#1c802c', categories: ['Garbage'] },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Street Lighting', color: '#497acf', categories: ['Streetlight'] },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Parks & Gardens', color: '#7c3aed', categories: ['Fallen tree'] },
  { id: '66666666-6666-4666-8666-666666666666', name: 'Public Health', color: '#c2410c', categories: ['Mosquito breeding'] },
  { id: '77777777-7777-4777-8777-777777777777', name: 'Anti-Encroachment', color: '#0f766e', categories: ['Illegal hoarding'] }
];

export interface IssueCategory {
  label: string;
  departmentId: string;
  departmentName: string;
  color: string;
}

export const ISSUE_CATEGORIES: IssueCategory[] = DEPARTMENTS.flatMap((department) =>
  department.categories.map((label) => ({
    label,
    departmentId: department.id,
    departmentName: department.name,
    color: department.color
  }))
);

const categoryIndex = new Map(
  ISSUE_CATEGORIES.map((entry) => [entry.label.toLowerCase(), entry])
);

export function isKnownCategory(category: string): boolean {
  return categoryIndex.has(String(category ?? '').trim().toLowerCase());
}

export function categoryColorFor(category: string): string {
  return categoryIndex.get(String(category ?? '').trim().toLowerCase())?.color ?? FALLBACK_CATEGORY_COLOR;
}

export function departmentNameFor(departmentId?: string | null): string {
  if (!departmentId) return 'Unassigned';
  return DEPARTMENTS.find((entry) => entry.id === departmentId)?.name ?? departmentId;
}
