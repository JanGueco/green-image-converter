import { useEffect, useState } from 'react';
import { formatKwh, formatKb } from '../utils/emissions';

export default function EmissionsCalculator({
  files,
  results,
  before,
  after,
  saved,
  estimatedViews,
  setEstimatedViews,
  fixedLinePercent,
  setFixedLinePercent,
  carbonOptions,
  selectedCarbonLabel,
  onCarbonFactorChange,
}) {
  const cellularPercent = 100 - fixedLinePercent;
  const [infoOpen, setInfoOpen] = useState(false);
  const selectedOption = carbonOptions?.find((o) => o.label === selectedCarbonLabel);
  const gridIntensityKgPerKwh = selectedOption?.kgPerKwh ?? 0.4361;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setInfoOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full rounded-xl border border-[#ddd] dark:border-[#333] bg-[#f5f5f3] dark:bg-[#1C1C1C]/90 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[#555] dark:text-[#888]">
          Carbon emissions calculator
        </h3>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="w-7 h-7 rounded-full border border-[#ccc] dark:border-[#444] bg-[#e8e8e6] dark:bg-[#252525] text-[#555] dark:text-[#888] hover:bg-[#ddd] dark:hover:bg-[#333] flex items-center justify-center text-sm font-bold font-serif"
          aria-label="Information about calculations"
        >
          i
        </button>
      </div>

      <div className="flex flex-wrap gap-6 items-end mb-4">
        <div>
          <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1">
            Estimated views per month
          </label>
          <input
            type="number"
            min={1}
            value={estimatedViews}
            onChange={(e) => setEstimatedViews(Math.max(1, Number(e.target.value) || 1))}
            className="w-32 px-3 py-2 rounded-lg border border-[#ccc] dark:border-[#444] bg-white dark:bg-[#252525] text-[#1C1C1C] dark:text-[#f5f5f0] text-sm"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1">
            Emissions region
          </label>
          <select
            value={selectedCarbonLabel}
            onChange={(e) => onCarbonFactorChange(e.target.value)}
            disabled={!carbonOptions?.length}
            className="w-full px-3 py-2 rounded-lg border border-[#ccc] dark:border-[#444] bg-white dark:bg-[#252525] text-[#1C1C1C] dark:text-[#f5f5f0] text-sm"
          >
            {carbonOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#555] dark:text-[#888] mb-1">
            Grid intensity
          </label>
          <span className="block px-3 py-2 rounded-lg border border-[#ccc] dark:border-[#444] bg-[#e8e8e6] dark:bg-[#252525] text-[#1C1C1C] dark:text-[#f5f5f0] text-sm font-medium">
            {gridIntensityKgPerKwh.toFixed(4)} kg CO₂/kWh
          </span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex justify-between text-xs text-[#555] dark:text-[#888] mb-1">
            <span>Fixed Line {fixedLinePercent}%</span>
            <span>Cellular {cellularPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={fixedLinePercent}
            onChange={(e) => setFixedLinePercent(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-[#ccc] dark:bg-[#444] accent-[#3A7D1E]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#555] dark:text-[#888] border-b border-[#ddd] dark:border-[#333]">
              <th className="py-2 pr-4 font-medium"></th>
              <th className="py-2 pr-4 font-medium">Before</th>
              <th className="py-2 font-medium">After</th>
            </tr>
          </thead>
          <tbody className="text-[#1C1C1C] dark:text-[#e0e0e0]">
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">Total file size</td>
              <td className="py-2 pr-4">{formatKb(before.totalKb)}</td>
              <td className="py-2">{after ? formatKb(after.totalKb) : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">Fixed transfer energy</td>
              <td className="py-2 pr-4">{formatKwh(before.fixedKwh)} kWh</td>
              <td className="py-2">{after ? `${formatKwh(after.fixedKwh)} kWh` : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">Cellular transfer energy</td>
              <td className="py-2 pr-4">{formatKwh(before.cellularKwh)} kWh</td>
              <td className="py-2">{after ? `${formatKwh(after.cellularKwh)} kWh` : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">Total energy</td>
              <td className="py-2 pr-4">{formatKwh(before.totalKwh)} kWh</td>
              <td className="py-2">{after ? `${formatKwh(after.totalKwh)} kWh` : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">If stored in HDD for a year</td>
              <td className="py-2 pr-4">{formatKwh(before.hddKwh)} kWh</td>
              <td className="py-2">{after ? `${formatKwh(after.hddKwh)} kWh` : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            <tr className="border-b border-[#eee] dark:border-[#333]">
              <td className="py-2 pr-4 text-[#555] dark:text-[#888]">If stored in SSD for a year</td>
              <td className="py-2 pr-4">{formatKwh(before.ssdKwh)} kWh</td>
              <td className="py-2">{after ? `${formatKwh(after.ssdKwh)} kWh` : <span className="text-[#999] dark:text-[#666]">—</span>}</td>
            </tr>
            {saved && (
              <tr className="bg-[#3A7D1E]/20 dark:bg-[#3A7D1E]/30 border-[#3A7D1E]/50 border-t-2">
                <td className="py-2 pr-4 font-semibold text-[#2D6316] dark:text-[#86efac]">Saved</td>
                <td colSpan={2} className="py-2 font-medium text-[#2D6316] dark:text-[#86efac]">
                  {Math.round(saved.sizeSavedKB).toLocaleString()} KB ({saved.sizeSavedPercent}% size) · Fixed {formatKwh(saved.fixedKwhSaved)} kWh · Cellular {formatKwh(saved.cellularKwhSaved)} kWh · HDD {formatKwh(saved.hddKwhSaved)} kWh · SSD {formatKwh(saved.ssdKwhSaved)} kWh · Total {formatKwh(saved.totalKwhSaved)} kWh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {infoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setInfoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="How we calculate energy use"
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-[#f5f5f3] dark:bg-[#1C1C1C] border border-[#ddd] dark:border-[#333] shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#333] text-[#555] dark:text-[#aaa] hover:bg-[#ddd] dark:hover:bg-[#444] flex items-center justify-center text-sm"
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#555] dark:text-[#888] mb-3 pr-8">
              How we calculate energy use
            </h4>
            <ul className="text-sm text-[#1C1C1C] dark:text-[#e0e0e0] space-y-1.5 mb-4">
              <li><strong>Fixed line (data transfer):</strong> 0.0065 kWh per GB</li>
              <li><strong>Cellular (data transfer):</strong> 0.1 kWh per GB</li>
              <li><strong>HDD storage:</strong> 5.5 kWh per TB per month (× 12 for one year)</li>
              <li><strong>SSD storage:</strong> 0.5 kWh per TB per month (× 12 for one year)</li>
            </ul>
            <p className="text-xs text-[#555] dark:text-[#888] leading-relaxed mb-3">
              <strong>Grid intensity and total CO₂e:</strong> We multiply total energy (kWh) by the grid intensity (kg CO₂/kWh) for the region you select to get total CO₂e in kg. So: <em>Total CO₂e = energy (kWh) × grid intensity</em>. You can choose a country or “Global” to use that region’s carbon intensity.
            </p>
            <p className="text-xs text-[#555] dark:text-[#888] leading-relaxed mb-3">
              These values reflect typical energy intensity for network transfer (fixed vs. cellular) and for running storage devices. Converting files to WebP and WebM reduces size, so less data is transferred and stored, which lowers energy use.
            </p>
            <p className="text-xs text-[#555] dark:text-[#888] leading-relaxed">
              <strong>No caching assumed.</strong> We assume no caching. In practice, caching would reduce “before” emissions, but it would also reduce “after” emissions even further, so the relative savings from converting still hold or improve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
