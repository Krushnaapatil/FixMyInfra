import { useCallback, useRef, useState } from 'react';

export type LocationStatus = 'idle' | 'locating' | 'located' | 'denied' | 'unavailable';

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: number;
}

interface GeolocationState {
  status: LocationStatus;
  location: CapturedLocation | null;
  message: string | null;
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function describeFailure(error: GeolocationPositionError): { status: LocationStatus; message: string } {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: 'denied',
      message: 'Location access was blocked. Allow it in your browser settings, or drop the pin manually on the map.'
    };
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return { status: 'unavailable', message: 'Your device could not determine a location. Drop the pin manually on the map.' };
  }
  return { status: 'unavailable', message: 'Locating timed out. Try again, or drop the pin manually on the map.' };
}

/**
 * Reads the device GPS. Deliberately never fires on mount: browsers treat an
 * unsolicited position request as intrusive, and it is frequently auto-blocked.
 * The report page triggers it from an explicit button and again when a photo is
 * captured, so the pin matches where the citizen actually was.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle', location: null, message: null });
  // Guards against a slow first fix landing after a newer one and moving the
  // pin backwards in time.
  const latestRequestId = useRef(0);

  const locate = useCallback(async (): Promise<CapturedLocation | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({
        status: 'unavailable',
        location: null,
        message: 'This browser cannot share your location. Drop the pin manually on the map.'
      });
      return null;
    }

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setState((current) => ({ ...current, status: 'locating', message: null }));

    return new Promise<CapturedLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (latestRequestId.current !== requestId) {
            resolve(null);
            return;
          }
          const next: CapturedLocation = {
            latitude: round6(position.coords.latitude),
            longitude: round6(position.coords.longitude),
            accuracy: position.coords.accuracy ?? null,
            capturedAt: position.timestamp
          };
          setState({ status: 'located', location: next, message: null });
          resolve(next);
        },
        (error) => {
          if (latestRequestId.current !== requestId) {
            resolve(null);
            return;
          }
          const { status, message } = describeFailure(error);
          setState((current) => ({ ...current, status, message }));
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 }
      );
    });
  }, []);

  return { ...state, locate };
}
