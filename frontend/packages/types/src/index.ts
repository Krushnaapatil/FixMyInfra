// TODO: generate these from the OpenAPI spec (backend/api-gateway/openapi.yaml)
// via `openapi-typescript` once the contract is finalized in Sprint 0.

export interface Complaint {
  id: string;
  category: string;
  description?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  status: 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  authenticityScore?: number;
  departmentId?: string;
  createdAt: string;
}
