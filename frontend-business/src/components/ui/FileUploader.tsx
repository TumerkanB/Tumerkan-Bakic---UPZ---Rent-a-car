import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { STORAGE_KEYS } from '../../config/constants';
import { env } from '../../config/env';
import { useToast } from './ToastContext';

interface FileUploaderProps {
  kind: 'image' | 'logo';
  onUploaded: (url: string) => void;
  label?: string;
}

export function FileUploader({ kind, onUploaded, label }: FileUploaderProps) {
  const { showError, showSuccess } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const res = await fetch(`${env.apiBaseUrl}/uploads/${kind}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (payload as { error?: { message?: string } } | null)?.error?.message ?? 'Upload failed';
        throw new Error(msg);
      }

      onUploaded((payload as { url: string }).url);
      showSuccess(`${kind === 'logo' ? 'Logo' : 'Image'} uploaded`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={kind === 'logo' ? '.svg,.png,.webp,image/svg+xml,image/png,image/webp' : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        <Upload className="h-3.5 w-3.5" />
        {uploading ? 'Uploading...' : (label ?? `Upload ${kind}`)}
      </button>
    </>
  );
}
