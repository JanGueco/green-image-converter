import { useState } from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResultsZone({ results, onShowPreview }) {
  const [hoverId, setHoverId] = useState(null);
  const entries = Object.entries(results);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 border border-[#ddd] dark:border-[#333] rounded-xl p-4 overflow-auto min-h-[200px]">
        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[140px] text-[#777] dark:text-[#555] text-sm text-center px-4">
            Converted files will appear here
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {entries.map(([fileId, result]) => (
              <div
                key={fileId}
                className="relative rounded-lg bg-[#eee] dark:bg-[#1C1C1C] border border-[#ddd] dark:border-[#333] overflow-hidden flex flex-col shrink-0 aspect-square animate-result-in"
                onMouseEnter={() => setHoverId(fileId)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="flex-1 bg-[#e0e0e0] dark:bg-[#222] flex items-center justify-center overflow-hidden relative">
                  {result.isImage ? (
                    <img src={result.previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={result.previewUrl} className="max-w-full max-h-full" controls />
                  )}
                </div>
                <div className="p-2 text-xs text-[#555] dark:text-[#aaa] truncate" title={result.filename}>
                  {result.filename}
                </div>
                <div className="px-2 pb-2 flex items-center justify-between text-xs">
                  <span className="text-[#777] dark:text-[#666]">{formatSize(result.newSize)}</span>
                  {result.reductionPercent != null && (
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        result.reductionPercent >= 0
                          ? 'bg-[#3A7D1E]/30 text-[#2D6316] dark:text-[#86efac]'
                          : 'bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {result.reductionPercent >= 0 ? '-' : '+'}
                      {Math.abs(result.reductionPercent)}%
                    </span>
                  )}
                </div>
                {hoverId === fileId && (
                  <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowPreview({ fileId, result });
                      }}
                      className="px-4 py-2 rounded-lg bg-[#3A7D1E] hover:bg-[#2D6316] text-white text-sm font-medium"
                    >
                      Show
                    </button>
                    <a
                      href={result.previewUrl}
                      download={result.filename}
                      className="px-4 py-2 rounded-lg bg-[#555] dark:bg-[#333] hover:bg-[#666] dark:hover:bg-[#444] text-white text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
