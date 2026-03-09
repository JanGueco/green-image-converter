import { useCallback, useRef } from 'react';

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const REJECT_EXT = ['.webp', '.webm'];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isRejected(name) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  return REJECT_EXT.includes(ext);
}

export default function UploadZone({ files, onFilesAdd, onRemove, progressMap }) {
  const fileInputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('border-[var(--color-primary)]', 'bg-primary/10');
      const items = Array.from(e.dataTransfer.files);
      const rejected = items.filter((f) => isRejected(f.name));
      if (rejected.length) {
        onFilesAdd(items.filter((f) => !isRejected(f.name)), '.webp and .webm files are not accepted.');
        return;
      }
      onFilesAdd(items, null);
    },
    [onFilesAdd]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[var(--color-primary)]', 'bg-primary/10');
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[var(--color-primary)]', 'bg-primary/10');
  };

  const onFileInput = (e) => {
    const items = Array.from(e.target.files || []);
    const rejected = items.filter((f) => isRejected(f.name));
    if (rejected.length) {
      onFilesAdd(items.filter((f) => !isRejected(f.name)), '.webp and .webm files are not accepted.');
    } else {
      onFilesAdd(items, null);
    }
    e.target.value = '';
  };

  const isImage = (file) => IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|gif|bmp|tiff?)$/i.test(file.name);
  const isVideo = (file) => VIDEO_TYPES.includes(file.type) || /\.(mp4|mov|avi|mkv)$/i.test(file.name);

  const hasFiles = files.length > 0;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl p-4 transition-colors flex flex-col overflow-hidden ${
          hasFiles
            ? 'border-[#ccc] dark:border-[#444] relative'
            : 'border-[#bbb] dark:border-[#444]'
        }`}
      >
        {!hasFiles && (
          <label className="flex-1 flex flex-col items-center justify-center cursor-pointer text-[#666] dark:text-[#888] hover:text-[#2D6316] dark:hover:text-[var(--color-primary)] min-h-[140px]">
            <span className="text-sm uppercase tracking-wider font-semibold mb-1">Drop files here</span>
            <span className="text-xs">Images (jpg, png, gif, bmp, tiff) or videos (mp4, mov, avi, mkv)</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(',')}
              className="hidden"
              onChange={onFileInput}
            />
          </label>
        )}

        {hasFiles && (
          <>
            <div className="absolute top-2 right-2 text-xs text-[#999] dark:text-[#555] pointer-events-none">
              Drop more files
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-medium bg-[#e0e0e0] dark:bg-[#333] text-[#555] dark:text-[#aaa] hover:bg-[#d0d0d0] dark:hover:bg-[#444]"
            >
              Add files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(',')}
              className="hidden"
              onChange={onFileInput}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 overflow-auto min-h-0 flex-1 pt-8">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="relative rounded-lg bg-[#eee] dark:bg-[#1C1C1C] border border-[#ddd] dark:border-[#333] overflow-hidden flex flex-col shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => onRemove(f.id)}
                    className="absolute top-1 right-1 z-10 w-7 h-7 rounded-full bg-black/70 text-red-400 hover:bg-black/90 flex items-center justify-center text-sm"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                  <div className="aspect-square bg-[#e0e0e0] dark:bg-[#222] flex items-center justify-center overflow-hidden">
                    {isImage(f.file) ? (
                      <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#888] dark:text-[#666] flex flex-col items-center gap-1">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H7l2.5-3.2 1.8 2.3 2.5-3.2L17 14z"/></svg>
                        <span className="text-xs truncate max-w-full px-1">{f.file.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-xs text-[#555] dark:text-[#aaa] truncate" title={f.file.name}>
                    {f.file.name}
                  </div>
                  <div className="px-2 pb-2 text-xs text-[#777] dark:text-[#666]">{formatSize(f.file.size)}</div>
                  {typeof progressMap[f.id] === 'number' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ddd] dark:bg-[#333]">
                      <div
                        className="h-full bg-[var(--color-primary)] transition-all duration-300"
                        style={{ width: `${progressMap[f.id]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
