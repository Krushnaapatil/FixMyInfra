import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEPARTMENTS,
  CATEGORY_LABELS,
  isKnownCategory,
  canonicalCategory,
  routeCategoryToDepartment,
  categoryColor,
  departmentName,
  FALLBACK_CATEGORY_COLOR
} from '../src/routing/departments.js';

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// complaint-service -> services -> backend -> repo root
const repoRoot = path.resolve(serviceRoot, '..', '..', '..');
const frontendCatalogue = path.join(
  repoRoot,
  'frontend',
  'packages',
  'types',
  'src',
  'index.ts'
);

test('every category routes to the department that declares it', () => {
  for (const department of DEPARTMENTS) {
    for (const category of department.categories) {
      assert.equal(
        routeCategoryToDepartment(category),
        department.id,
        `"${category}" should route to ${department.name}`
      );
    }
  }
});

test('category matching ignores case and surrounding whitespace', () => {
  assert.equal(routeCategoryToDepartment('  road DAMAGE '), DEPARTMENTS[0].id);
  assert.equal(isKnownCategory('GARBAGE'), true);
});

test('canonicalCategory returns the catalogue spelling used for storage', () => {
  // The service stores this value, so casing variants must collapse onto one
  // label instead of becoming separate reporting buckets.
  assert.equal(canonicalCategory('  gArBaGe  '), 'Garbage');
  assert.equal(canonicalCategory('ROAD DAMAGE'), 'Road damage');
  assert.equal(canonicalCategory('mosquito breeding'), 'Mosquito breeding');
  for (const label of CATEGORY_LABELS) {
    assert.equal(canonicalCategory(label), label, `${label} must round-trip unchanged`);
  }
  assert.equal(canonicalCategory('POTHOLE'), null);
  assert.equal(canonicalCategory(null), null);
});

test('every canonical label round-trips through the routing lookup', () => {
  for (const label of CATEGORY_LABELS) {
    assert.equal(isKnownCategory(canonicalCategory(label)), true);
  }
});

test('unknown categories are rejected and never resolve to a department', () => {
  // Regression guard: these used to be accepted and stored with a null
  // department, leaving the complaint in the unrouted pool forever.
  for (const bogus of ['POTHOLE', 'pothole', 'other', '', null, undefined, 42]) {
    assert.equal(isKnownCategory(bogus), false, `${String(bogus)} must not be a known category`);
    assert.equal(routeCategoryToDepartment(bogus), null);
  }
});

test('every category has a colour and a known department name', () => {
  for (const category of CATEGORY_LABELS) {
    assert.match(categoryColor(category), /^#[0-9a-f]{6}$/i, `${category} needs a hex colour`);
    assert.notEqual(categoryColor(category), FALLBACK_CATEGORY_COLOR);
    const departmentId = routeCategoryToDepartment(category);
    assert.ok(departmentName(departmentId), `${category} has no department name`);
  }
});

test('category labels are unique', () => {
  assert.equal(new Set(CATEGORY_LABELS).size, CATEGORY_LABELS.length);
});

test('frontend catalogue matches the backend catalogue', () => {
  const source = fs.readFileSync(frontendCatalogue, 'utf8');
  const block = source.match(/export const DEPARTMENTS: Department\[\] = (\[[\s\S]*?\n\]);/);
  assert.ok(block, 'could not find the DEPARTMENTS array in frontend/packages/types/src/index.ts');

  // The frontend file is TypeScript, but this array is plain data, so evaluating
  // it as an object literal keeps the test free of a TS toolchain.
  const frontendDepartments = new Function(`return ${block[1]}`)();

  assert.deepEqual(
    frontendDepartments,
    DEPARTMENTS,
    'frontend/packages/types DEPARTMENTS has drifted from the backend catalogue'
  );
});
