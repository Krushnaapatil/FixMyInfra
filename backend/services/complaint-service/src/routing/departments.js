// Single source of truth for the issue catalogue.
//
// The citizen portal's category dropdown, the map pin colours, the complaint
// card thumbnails and the department routing table are all derived from this
// list. A category that is not declared here is rejected by the API, so a
// complaint can never be stored without a department to own it.
//
// frontend/packages/types mirrors this file; test/catalog.test.js fails if the
// two ever drift apart.
export const DEPARTMENTS = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Roads & Footpaths', color: '#e23529', categories: ['Road damage'] },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Water & Drainage', color: '#e9b406', categories: ['Water and drainage'] },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Sanitation', color: '#1c802c', categories: ['Garbage'] },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Street Lighting', color: '#497acf', categories: ['Streetlight'] },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Parks & Gardens', color: '#7c3aed', categories: ['Fallen tree'] },
  { id: '66666666-6666-4666-8666-666666666666', name: 'Public Health', color: '#c2410c', categories: ['Mosquito breeding'] },
  { id: '77777777-7777-4777-8777-777777777777', name: 'Anti-Encroachment', color: '#0f766e', categories: ['Illegal hoarding'] }
];

// Colour used for rows that predate the catalogue (or were written directly to
// the database). Deliberately neutral so it never reads as a real category.
export const FALLBACK_CATEGORY_COLOR = '#64748b';

function normalize(category) {
  return String(category ?? '').trim().toLowerCase();
}

const categoryIndex = new Map(
  DEPARTMENTS.flatMap((department) =>
    department.categories.map((label) => [normalize(label), { label, department }])
  )
);

export const CATEGORY_LABELS = [...categoryIndex.values()].map((entry) => entry.label);

export function isKnownCategory(category) {
  return categoryIndex.has(normalize(category));
}

/**
 * The catalogue spelling of a category. Input is accepted case- and
 * whitespace-insensitively, but the canonical label is what gets stored, so
 * "  gArBaGe  " cannot become a second, separate "gArBaGe" bucket in reporting.
 * Returns null for anything outside the catalogue.
 */
export function canonicalCategory(category) {
  return categoryIndex.get(normalize(category))?.label ?? null;
}

/**
 * Resolves a category to its owning department, or null when the category is
 * not in the catalogue. Callers that create complaints should validate with
 * isKnownCategory first so a null here can only mean legacy data.
 */
export function routeCategoryToDepartment(category) {
  return categoryIndex.get(normalize(category))?.department.id ?? null;
}

export function categoryColor(category) {
  return categoryIndex.get(normalize(category))?.department.color ?? FALLBACK_CATEGORY_COLOR;
}

export function departmentName(id) {
  return DEPARTMENTS.find((entry) => entry.id === id)?.name ?? null;
}
