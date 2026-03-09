import { useCallback, useEffect, useMemo, useState } from 'react';
import UploadZone from './components/UploadZone';
import ResultsZone from './components/ResultsZone';
import MetricsBar from './components/MetricsBar';
import ConvertButton from './components/ConvertButton';
import QualitySliders from './components/QualitySliders';
import EmissionsCalculator from './components/EmissionsCalculator';
import SummaryTotalsPanel from './components/SummaryTotalsPanel';
import Toast from './components/Toast';
import { useEmissionsData } from './hooks/useEmissionsData';
import ComparisonModal from './components/ComparisonModal';
import { startConvert, convertWithProgress } from './api/convert';
import './index.css';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function uniqueResultFilename(filename, existingFilenames) {
  if (!existingFilenames.has(filename)) return filename;
  const lastDot = filename.lastIndexOf('.');
  const base = lastDot >= 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot >= 0 ? filename.slice(lastDot) : '';
  let n = 1;
  while (existingFilenames.has(`${base}(${n})${ext}`)) n += 1;
  return `${base}(${n})${ext}`;
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState({});
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [preview, setPreview] = useState(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [webpQuality, setWebpQuality] = useState(85);
  const [webmCrf, setWebmCrf] = useState(33);
  const [estimatedViews, setEstimatedViews] = useState(100000);
  const [fixedLinePercent, setFixedLinePercent] = useState(80);
  const [carbonOptions, setCarbonOptions] = useState([
    { label: 'Global', value: 'Global', kgPerKwh: 0.4361 },
  ]);
  const [selectedCarbonLabel, setSelectedCarbonLabel] = useState('Global');

  const { before, after, saved } = useEmissionsData(files, results, estimatedViews, fixedLinePercent);

  useEffect(() => {
    fetch('/carbon-intensity-latest.csv')
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length < 4) continue;
          const entity = parts[0].trim();
          const intensityG = parseFloat(parts[3].trim());
          if (!entity || Number.isNaN(intensityG)) continue;
          rows.push({ label: entity, value: entity, kgPerKwh: intensityG / 1000 });
        }
        rows.sort((a, b) => a.label.localeCompare(b.label));
        setCarbonOptions([{ label: 'Global', value: 'Global', kgPerKwh: 0.4361 }, ...rows]);
      })
      .catch(() => {});
  }, []);

  const carbonFactorKgPerKwh = useMemo(
    () => carbonOptions.find((o) => o.label === selectedCarbonLabel)?.kgPerKwh ?? 0.4361,
    [carbonOptions, selectedCarbonLabel]
  );

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const onFilesAdd = useCallback((newFiles, toastMessage) => {
    if (!newFiles?.length) return;
    setFiles((prev) => {
      const next = [...prev];
      for (const file of newFiles) {
        const id = generateId();
        const previewUrl = (file.type.startsWith('image/') || file.type.startsWith('video/')) ? URL.createObjectURL(file) : null;
        next.push({ id, file, previewUrl });
      }
      return next;
    });
    if (toastMessage) setToast(toastMessage);
  }, []);

  const onRemove = useCallback((id) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
    setResults((r) => {
      const next = { ...r };
      const res = next[id];
      if (res?.previewUrl) URL.revokeObjectURL(res.previewUrl);
      delete next[id];
      return next;
    });
    setProgressMap((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  }, []);

  const convertAll = useCallback(async () => {
    if (!files.length) return;
    setStatus('converting');
    setProgressMap({});

    for (const { id, file } of files) {
      setProgressMap((p) => ({ ...p, [id]: 0 }));
      try {
        const { job_id } = await startConvert(file, { webpQuality, webmCrf });
        const { blob, filename } = await convertWithProgress(job_id, (progress) => {
          setProgressMap((p) => ({ ...p, [id]: progress }));
        });
        const newSize = blob.size;
        const originalSize = file.size;
        const reductionPercent =
          originalSize > 0
            ? Math.round((1 - newSize / originalSize) * 100)
            : null;
        const previewUrl = URL.createObjectURL(blob);
        const isImage = filename.endsWith('.webp');
        setResults((r) => {
          const existing = new Set(Object.values(r).map((x) => x.filename));
          const finalFilename = uniqueResultFilename(filename, existing);
          return {
            ...r,
            [id]: {
              blob,
              filename: finalFilename,
              newSize,
              originalName: file.name,
              originalSize: file.size,
              reductionPercent,
              previewUrl,
              isImage,
            },
          };
        });
      } catch (err) {
        setToast(err.message || 'Conversion failed');
      }
      setProgressMap((p) => ({ ...p, [id]: 100 }));
    }

    setStatus('done');
  }, [files, webpQuality, webmCrf]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6] dark:bg-[#1A1A2E]">
      <header className="py-4 px-4 border-b border-[#ddd] dark:border-[#333] flex items-center justify-between bg-[#F8F8F6] dark:bg-[#1A1A2E]">
        <h1 className="text-xl font-bold uppercase tracking-wider text-[#2D6316] dark:text-[#3A7D1E]">GreenConvert</h1>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#555] dark:text-[#aaa] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      <main className="flex-1 flex flex-col min-h-0 p-4 gap-4 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[1fr_auto_auto]">
        <section className="min-h-0 flex flex-col order-1 md:col-start-1 md:row-start-1">
          <h2 className="text-xs uppercase tracking-wider text-[#555] dark:text-[#666] mb-2">Upload</h2>
          <UploadZone
            files={files}
            onFilesAdd={onFilesAdd}
            onRemove={onRemove}
            progressMap={progressMap}
          />
        </section>
        <section className="min-h-0 flex flex-col order-3 md:order-none md:col-start-2 md:row-start-1">
          <h2 className="text-xs uppercase tracking-wider text-[#555] dark:text-[#666] mb-2">Results</h2>
          <ResultsZone results={results} onShowPreview={setPreview} />
        </section>
        <div className="flex flex-col gap-3 shrink-0 order-2 md:col-span-2 md:row-start-2">
          <MetricsBar fileCount={files.length} status={status} />
          <QualitySliders
            files={files}
            webpQuality={webpQuality}
            webmCrf={webmCrf}
            onWebpQualityChange={setWebpQuality}
            onWebmCrfChange={setWebmCrf}
          />
          <ConvertButton
            disabled={files.length === 0}
            loading={status === 'converting'}
            onClick={convertAll}
          />
          <EmissionsCalculator
            files={files}
            results={results}
            before={before}
            after={after}
            saved={saved}
            estimatedViews={estimatedViews}
            setEstimatedViews={setEstimatedViews}
            fixedLinePercent={fixedLinePercent}
            setFixedLinePercent={setFixedLinePercent}
            carbonOptions={carbonOptions}
            selectedCarbonLabel={selectedCarbonLabel}
            onCarbonFactorChange={setSelectedCarbonLabel}
          />
        </div>
        <div className="w-full shrink-0 order-4 md:col-span-2">
          <SummaryTotalsPanel
            before={before}
            after={after}
            saved={saved}
            fileCount={Object.keys(results).length}
            carbonFactorKgPerKwh={carbonFactorKgPerKwh}
          />
        </div>
      </main>

      <Toast message={toast} onDismiss={() => setToast(null)} />
      <ComparisonModal comparison={preview} files={files} onClose={() => setPreview(null)} />
    </div>
  );
}
