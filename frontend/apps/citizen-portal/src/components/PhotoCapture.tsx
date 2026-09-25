import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImageOff, LoaderCircle, MapPin, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  uploadComplaintPhoto
} from '@fixmyinfra/api-client';

type Source = 'choose' | 'camera';
type CameraState = 'off' | 'starting' | 'live' | 'blocked';

interface PhotoCaptureProps {
  imageUrl: string;
  onUploaded: (imageUrl: string) => void;
  onCleared: () => void;
  /** Fired the moment a photo is taken or picked, so the caller can re-read GPS. */
  onPhotoSelected: () => void;
  disabled?: boolean;
}

function readableSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoCapture({ imageUrl, onUploaded, onCleared, onPhotoSelected, disabled }: PhotoCaptureProps) {
  const [source, setSource] = useState<Source>('choose');
  const [cameraState, setCameraState] = useState<CameraState>('off');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // The ref is authoritative for shutting tracks down; the state copy only
  // exists to switch the panel over to the live viewfinder.
  const streamRef = useRef<MediaStream | null>(null);
  const deviceInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  // Object URLs are revoked explicitly; letting them pile up leaks the whole
  // image in memory for the life of the tab.
  const previewObjectUrl = useRef<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const releasePreview = useCallback(() => {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }
  }, []);

  // The stream must be attached in an effect, not inline in startCamera: the
  // <video> only exists once React has committed the live-camera branch, which
  // happens after the awaited getUserMedia call has already returned. Assigning
  // srcObject inline therefore hit a null ref and left a black viewfinder.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => undefined);
  }, [stream, cameraState]);

  useEffect(() => () => {
    // Stop tracks through the ref only: calling stopStream() here would set
    // state while the component is unmounting.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    releasePreview();
  }, [releasePreview]);

  async function startCamera() {
    setCameraError(null);
    setSource('camera');
    if (cameraState === 'live' || cameraState === 'starting') return;

    // getUserMedia is only exposed in a secure context. localhost counts, but a
    // LAN IP such as http://192.168.x.x:5173 does not, and the browser then
    // fails with an opaque error that looks like "no camera".
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraState('blocked');
      setCameraError('Your browser only allows camera access on a secure connection. Open this page via http://localhost:5173 or over HTTPS.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('blocked');
      setCameraError('This browser cannot open a camera here. Use "Choose from device", or allow camera access to take a photo.');
      return;
    }

    setCameraState('starting');
    try {
      // Rear camera first (the citizen is pointing at the problem), then fall
      // back to the front camera on devices without one.
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };
      let acquired: MediaStream;
      try {
        acquired = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        acquired = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      // Committing the stream flips the panel to the live branch, which mounts
      // the <video>; the effect above then attaches this stream to it.
      streamRef.current = acquired;
      setStream(acquired);
      setCameraState('live');
    } catch (error) {
      const name = (error as { name?: string })?.name;
      setCameraState('blocked');
      setCameraError(
        name === 'NotAllowedError'
          ? 'Camera access was blocked. Allow it in your browser settings (the icon in the address bar), or use "Choose from device".'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'No camera was found on this device. Use "Choose from device" to attach a photo.'
            : 'The camera could not be started. Close any other app using it, or use "Choose from device".'
      );
    }
  }

  function stopCamera() {
    stopStream();
    setCameraState('off');
  }

  function validate(file: File): string | null {
    if (!(ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      return 'That file is not a supported image. Use JPG, PNG, WEBP, GIF or HEIC.';
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return `That photo is ${readableSize(file.size)}. The maximum is ${readableSize(MAX_PHOTO_BYTES)}.`;
    }
    return null;
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onPhotoSelected();

    releasePreview();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrl.current = objectUrl;
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      const uploadedUrl = await uploadComplaintPhoto(file);
      onUploaded(uploadedUrl);
    } catch (uploadError) {
      setError(
        (uploadError as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? 'We could not upload your photo. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function captureFromCamera() {
    const video = videoRef.current;
    // No frames decoded yet means the stream never reached the element. Say so
    // instead of returning silently, which reads as a broken button.
    if (!video || !video.videoWidth) {
      setError('The camera is still starting. Wait a moment, then press Capture photo again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setError('We could not read the camera frame. Please try again.');
      return;
    }

    stopCamera();
    await handleFile(new File([blob], `complaint-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  }

  function clearPhoto() {
    stopCamera();
    releasePreview();
    setPreviewUrl(null);
    setError(null);
    setCameraState('off');
    onCleared();
  }

  const tabClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
      active ? 'bg-[#0D7A6E] text-white shadow-sm' : 'text-[#617c79] hover:bg-[#eef7f5]'
    }`;

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-[#315250]">
        Photo evidence <span className="font-normal text-[#9aacab]">(optional)</span>
      </span>

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-[#dce9e6] bg-white">
          <div className="relative bg-[#0b1f21]">
            <img src={previewUrl} alt="Selected complaint evidence" className="h-56 w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b1f21]/70 text-sm font-semibold text-white">
                <LoaderCircle className="animate-spin" size={22} />
                Uploading photo...
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D7A6E]">
              <MapPin size={13} />
              {uploading ? 'Uploading...' : imageUrl ? 'Photo attached' : 'Photo ready'}
            </p>
            <button
              type="button"
              onClick={clearPhoto}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#b84d4d] transition hover:bg-[#fff5f5] disabled:opacity-50"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#dce9e6] bg-white p-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f4f9f8] p-1">
            <button type="button" className={tabClass(source === 'choose')} onClick={() => { stopCamera(); setSource('choose'); }} disabled={disabled}>
              <Upload size={15} />
              Choose from device
            </button>
            <button type="button" className={tabClass(source === 'camera')} onClick={() => void startCamera()} disabled={disabled}>
              <Camera size={15} />
              Take photo
            </button>
          </div>

          {source === 'choose' && (
            <div className="mt-3">
              <input
                ref={deviceInputRef}
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(',')}
                className="sr-only"
                onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => deviceInputRef.current?.click()}
                disabled={disabled}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-[#cfe3df] bg-[#f8fcfb] px-4 py-7 text-center transition hover:border-[#0D7A6E] hover:bg-[#f2faf8] disabled:opacity-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9f2ec] text-[#0D7A6E]">
                  <Upload size={19} />
                </span>
                <span className="text-sm font-semibold text-[#315250]">Upload a photo from this device</span>
                <span className="text-xs text-[#9aacab]">JPG, PNG, WEBP, GIF or HEIC up to {readableSize(MAX_PHOTO_BYTES)}</span>
              </button>
            </div>
          )}

          {source === 'camera' && (
            <div className="mt-3">
              {stream ? (
                <div className="overflow-hidden rounded-xl border border-[#dce9e6] bg-[#0b1f21]">
                  <video ref={videoRef} playsInline muted autoPlay className="h-56 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5">
                    <button type="button" onClick={stopCamera} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#617c79] transition hover:bg-[#f4f9f8]">
                      <RefreshCw size={13} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void captureFromCamera()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0D7A6E] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0a6459]"
                    >
                      <Camera size={15} />
                      Capture photo
                    </button>
                  </div>
                </div>
              ) : cameraState === 'blocked' ? (
                <div className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-4 text-sm text-[#b84d4d]">
                  <p className="flex items-start gap-2 font-medium">
                    <ImageOff size={16} className="mt-0.5 shrink-0" />
                    {cameraError}
                  </p>
                  <input
                    ref={nativeCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      void handleFile(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0D7A6E] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#0a6459]"
                  >
                    <Camera size={15} />
                    Open device camera
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#cfe3df] bg-[#f8fcfb] px-4 py-7 text-center">
                  {cameraState === 'starting' ? (
                    <>
                      <LoaderCircle className="animate-spin text-[#0D7A6E]" size={22} />
                      <span className="text-sm font-semibold text-[#315250]">Starting camera...</span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9f2ec] text-[#0D7A6E]">
                        <Camera size={19} />
                      </span>
                      <span className="text-sm font-semibold text-[#315250]">Capture the issue where it stands</span>
                      <span className="text-xs text-[#9aacab]">Your location is recorded at the moment you take the photo.</span>
                      <button
                        type="button"
                        onClick={() => void startCamera()}
                        className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#0D7A6E] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0a6459]"
                      >
                        <Camera size={15} />
                        Start camera
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 rounded-lg border border-[#f2c9c9] bg-[#fff5f5] px-3 py-2 text-xs font-medium text-[#b84d4d]">
          {error}
        </p>
      )}
    </div>
  );
}
