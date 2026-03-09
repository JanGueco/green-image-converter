const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

function isImage(file) {
  return IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|gif|bmp|tiff?)$/i.test(file.name);
}
function isVideo(file) {
  return VIDEO_TYPES.includes(file.type) || /\.(mp4|mov|avi|mkv)$/i.test(file.name);
}

export default function QualitySliders({
  files,
  webpQuality,
  webmCrf,
  onWebpQualityChange,
  onWebmCrfChange,
}) {
  const hasImages = files.some((f) => isImage(f.file));
  const hasVideos = files.some((f) => isVideo(f.file));

  if (!hasImages && !hasVideos) return null;

  return (
    <div className="flex flex-wrap gap-6 items-center py-2 px-4 rounded-xl bg-[#eee] dark:bg-[#1C1C1C]/80 border border-[#ddd] dark:border-[#333]">
      {hasImages && (
        <div className="flex items-center gap-3 min-w-[200px]">
          <label className="text-sm font-medium text-[#555] dark:text-[#aaa] shrink-0">
            {hasVideos ? 'WebP Quality:' : 'Quality:'} {webpQuality}
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={webpQuality}
            onChange={(e) => onWebpQualityChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[#ccc] dark:bg-[#444] accent-[#3A7D1E]"
          />
        </div>
      )}
      {hasVideos && (
        <div className="flex items-center gap-3 min-w-[200px]">
          <label className="text-sm font-medium text-[#555] dark:text-[#aaa] shrink-0">
            {hasImages ? 'WebM Compression:' : 'Compression (Low → High):'} {webmCrf}
          </label>
          <input
            type="range"
            min={0}
            max={63}
            value={webmCrf}
            onChange={(e) => onWebmCrfChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[#ccc] dark:bg-[#444] accent-[#3A7D1E]"
          />
        </div>
      )}
    </div>
  );
}
