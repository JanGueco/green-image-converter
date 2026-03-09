import { useCallback, useEffect, useRef, useState } from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ComparisonModal({ comparison, files, onClose }) {
  const [splitPercent, setSplitPercent] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);
  const videoLeftRef = useRef(null);
  const videoRightRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!comparison || !comparison.result.isImage) return;
    const move = (e) => {
      if (!containerRef.current || !dragging) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      if (clientX == null) return;
      const x = clientX - rect.left;
      const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPercent(pct);
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [comparison, dragging]);

  const syncVideos = useCallback((source, target) => {
    if (!target?.current || source?.currentTime === undefined) return;
    if (Math.abs(target.current.currentTime - source.currentTime) > 0.2) {
      target.current.currentTime = source.currentTime;
    }
  }, []);

  if (!comparison) return null;
  const { fileId, result } = comparison;
  const fileEntry = files.find((f) => f.id === fileId);
  const originalPreviewUrl = fileEntry?.previewUrl ?? null;
  const originalName = result.originalName ?? fileEntry?.file.name ?? 'Original';
  const originalSize = result.originalSize ?? fileEntry?.file.size ?? 0;

  const hasOriginal = !!originalPreviewUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Before and after comparison"
    >
      <div
        className="relative w-full max-w-6xl h-[90vh] min-h-[400px] flex flex-col bg-[#eee] dark:bg-[#1C1C1C] rounded-xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-black/70 text-white hover:bg-black/90 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex border-b border-[#ddd] dark:border-[#333] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#555] dark:text-[#888]">
          <span className="flex-1">Original</span>
          <span className="flex-1 text-right">Converted</span>
        </div>

        <div ref={containerRef} className="flex-1 flex min-h-0 relative min-h-[300px]">
          {result.isImage ? (
            <div className="flex-1 flex flex-col min-h-0 w-full">
              <div className="flex-1 relative flex items-center justify-center min-h-[280px] bg-[#e0e0e0] dark:bg-[#222]">
                <div className="relative w-full h-full flex items-center justify-center p-4 select-none">
                  {hasOriginal && (
                    <>
                      <img
                        src={result.previewUrl}
                        alt="Converted"
                        draggable={false}
                        className="max-w-full max-h-full w-full h-full object-contain absolute inset-0 m-auto"
                        style={{ objectFit: 'contain' }}
                      />
                      <img
                        src={originalPreviewUrl}
                        alt="Original"
                        draggable={false}
                        className="max-w-full max-h-full w-full h-full object-contain absolute inset-0 m-auto"
                        style={{
                          objectFit: 'contain',
                          clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                          WebkitClipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                        }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-[#3A7D1E] cursor-col-resize flex items-center justify-center z-10 group"
                        style={{ left: `${splitPercent}%`, transform: 'translateX(-50%)' }}
                        onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
                        onTouchStart={(e) => { e.preventDefault(); setDragging(true); }}
                      >
                        <div className="w-1.5 h-12 rounded-full bg-white shadow opacity-80 group-hover:opacity-100 pointer-events-none" />
                      </div>
                    </>
                  )}
                  {!hasOriginal && (
                    <img
                      src={result.previewUrl}
                      alt="Converted"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>
              <div className="flex border-t border-[#ddd] dark:border-[#333] px-4 py-2 text-xs text-[#555] dark:text-[#aaa]">
                <span className="flex-1">Original: {formatSize(originalSize)}</span>
                <span className="flex-1 text-right">Converted: {formatSize(result.newSize)}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col min-w-0 p-2 border-r border-[#ddd] dark:border-[#333]">
                <div className="flex-1 flex items-center justify-center min-h-0 bg-[#e0e0e0] dark:bg-[#222] rounded">
                  {hasOriginal ? (
                    <video
                      ref={videoLeftRef}
                      src={originalPreviewUrl}
                      className="max-w-full max-h-full"
                      controls
                      onPlay={() => videoRightRef.current?.play()}
                      onPause={() => videoRightRef.current?.pause()}
                      onTimeUpdate={() => syncVideos(videoLeftRef.current, videoRightRef)}
                    />
                  ) : (
                    <span className="text-[#777] dark:text-[#555] text-sm">Original no longer in queue</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-[#555] dark:text-[#aaa] text-center">
                  {formatSize(originalSize)}
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0 p-2">
                <div className="flex-1 flex items-center justify-center min-h-0 bg-[#e0e0e0] dark:bg-[#222] rounded">
                  <video
                    ref={videoRightRef}
                    src={result.previewUrl}
                    className="max-w-full max-h-full"
                    controls
                    onPlay={() => videoLeftRef.current?.play()}
                    onPause={() => videoLeftRef.current?.pause()}
                    onTimeUpdate={() => syncVideos(videoRightRef.current, videoLeftRef)}
                  />
                </div>
                <div className="mt-1 text-xs text-[#555] dark:text-[#aaa] text-center">
                  {formatSize(result.newSize)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
