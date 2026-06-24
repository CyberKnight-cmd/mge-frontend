'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Plus, X, Loader2, AlertCircle, ZoomIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cropAndCompress, type CroppedArea } from '@/lib/imageUtils';

interface CatalystImage {
  id: number;
  imageUrl: string;
  originalFileName: string;
}

interface Props {
  entryId: number;
  currentImageCount: number;
  onUploadComplete: (image: CatalystImage) => void;
}

export default function ImageUploader({ entryId, currentImageCount, onUploadComplete }: Props) {
  const { isAuthenticated, authFetch } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [aspect, setAspect] = useState<number>(4 / 3);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ASPECT_OPTIONS = [
    { label: '4:3', value: 4 / 3 },
    { label: '3:4', value: 3 / 4 },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '9:16', value: 9 / 16 },
  ];

  const canUpload = isAuthenticated && currentImageCount < 3;

  useEffect(() => {
    if (!selectedFile) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP files');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile(reader.result as string);
      setError(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspect(4 / 3);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: any, pixels: CroppedArea) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const closeModal = () => {
    setSelectedFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);
    try {
      const file = await cropAndCompress(selectedFile, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch(`/api/v1/catalog/${entryId}/images`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message || `Upload failed (${res.status})`);
      }
      const body = await res.json();
      onUploadComplete(body.data ?? body);
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) return null;

  return (
    <>
      {/* Upload tile */}
      <div
        onClick={() => fileRef.current?.click()}
        className="aspect-square bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-surface-container-low transition-colors group"
      >
        <Plus size={24} className="text-outline group-hover:text-primary transition-colors" />
        <span className="text-[10px] text-outline group-hover:text-primary mt-1 text-label-caps font-label-caps">
          ADD
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Crop modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-surface-container-lowest border border-outline-variant w-full max-w-[calc(100vw-24px)] md:max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant">
              <h3 className="text-label-caps font-label-caps text-on-surface">CROP & UPLOAD</h3>
              <button onClick={closeModal} className="p-1 text-outline hover:text-on-surface transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full aspect-square bg-black">
              <Cropper
                image={selectedFile}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Aspect ratio */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-t border-outline-variant">
              <span className="text-[10px] text-label-caps font-label-caps text-outline shrink-0">RATIO</span>
              {ASPECT_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setAspect(opt.value)}
                  className={`px-2.5 py-1 text-[10px] text-label-caps font-label-caps transition-colors ${
                    aspect === opt.value
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-3 px-5 py-3 border-t border-outline-variant">
              <ZoomIn size={14} className="text-outline shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-[11px] font-mono text-outline w-8 text-right">{zoom.toFixed(1)}x</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 mx-5 mb-3 bg-error/10 border border-error/30 px-3 py-2 text-[12px] text-error">
                <AlertCircle size={12} />{error}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-outline-variant">
              <button
                onClick={closeModal}
                disabled={uploading}
                className="px-4 py-2 border border-outline-variant text-label-caps font-label-caps text-[11px] hover:bg-surface-container transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary text-label-caps font-label-caps text-[11px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploading ? <><Loader2 size={12} className="animate-spin" /> UPLOADING…</> : 'UPLOAD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
