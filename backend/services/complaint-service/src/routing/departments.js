// Default department directory used for category routing until
// user-department-service owns departments. IDs are fixed so routing is
// stable across restarts and environments. Keep in sync with the
// DEPARTMENTS copy in frontend/packages/types.
export const DEPARTMENTS = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Roads & Footpaths', categories: ['Road damage'] },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Water & Drainage', categories: ['Water and drainage'] },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Sanitation', categories: ['Garbage'] },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Street Lighting', categories: ['Streetlight'] }
];

export function routeCategoryToDepartment(category) {
  const normalized = String(category ?? '').trim().toLowerCase();
  const department = DEPARTMENTS.find((entry) =>
    entry.categories.some((candidate) => candidate.toLowerCase() === normalized)
  );
  return department?.id ?? null;
}

export function departmentName(id) {
  return DEPARTMENTS.find((entry) => entry.id === id)?.name ?? null;
}
