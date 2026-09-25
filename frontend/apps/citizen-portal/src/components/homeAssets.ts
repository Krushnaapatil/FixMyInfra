import pinRed from '../assets/home/pin-red.png';
import pinYellow from '../assets/home/pin-yellow.png';
import pinGreen from '../assets/home/pin-green.png';
import pinBlue from '../assets/home/pin-blue.png';
import thumbPothole from '../assets/home/thumb-pothole.png';
import thumbStreetlight from '../assets/home/thumb-streetlight.png';
import thumbGarbage from '../assets/home/thumb-garbage.png';
import thumbWater from '../assets/home/thumb-water.png';
import thumbTree from '../assets/home/thumb-tree.png';
import thumbMosquito from '../assets/home/thumb-mosquito.png';
import thumbHoarding from '../assets/home/thumb-hoarding.png';
import { ISSUE_CATEGORIES } from '@fixmyinfra/types';

// Nashik city centre (near Panchavati): default map focus and prefilled
// report location — citizens adjust to the exact issue spot.
export const NASHIK_CENTER = { latitude: 19.9975, longitude: 73.7898 };

// Pin and thumbnail art is keyed off the shared issue catalogue instead of
// substring guesses. The old matching sent "Fallen tree" and "Mosquito
// breeding" to the pothole thumbnail because neither contains "garbag" or
// "streetlight".
//
// Only four map-pin assets exist, so departments share a pin by design; every
// category has its own thumbnail so no card can show unrelated evidence.
const artByDepartmentId: Record<string, { pin: string; thumb: string }> = {
  '11111111-1111-4111-8111-111111111111': { pin: pinRed, thumb: thumbPothole },
  '22222222-2222-4222-8222-222222222222': { pin: pinYellow, thumb: thumbWater },
  '33333333-3333-4333-8333-333333333333': { pin: pinGreen, thumb: thumbGarbage },
  '44444444-4444-4444-8444-444444444444': { pin: pinBlue, thumb: thumbStreetlight },
  '55555555-5555-4555-8555-555555555555': { pin: pinGreen, thumb: thumbTree },
  '66666666-6666-4666-8666-666666666666': { pin: pinYellow, thumb: thumbMosquito },
  '77777777-7777-4777-8777-777777777777': { pin: pinBlue, thumb: thumbHoarding }
};

const defaultArt = { pin: pinRed, thumb: thumbPothole };

function artForCategory(category: string) {
  const entry = ISSUE_CATEGORIES.find(
    (candidate) => candidate.label.toLowerCase() === category.trim().toLowerCase()
  );
  return artByDepartmentId[entry?.departmentId ?? ''] ?? defaultArt;
}

export function pinForCategory(category: string): string {
  return artForCategory(category).pin;
}

export function thumbForCategory(category: string): string {
  return artForCategory(category).thumb;
}

