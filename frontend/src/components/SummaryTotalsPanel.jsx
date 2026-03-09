import { formatKwh } from '../utils/emissions';

function SummaryBlock({ label, value, placeholder = false, co2Kg = null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/80">
        {label}
      </span>
      <span className={`text-lg sm:text-xl font-bold text-white ${placeholder ? 'opacity-70' : ''}`}>
        {placeholder ? '—' : value}
      </span>
      {co2Kg != null && (
        <span className={`text-xl sm:text-2xl font-bold text-white ${placeholder ? 'opacity-70' : ''}`}>
          {placeholder ? '—' : `${Number(co2Kg).toFixed(2)} kg CO₂`}
        </span>
      )}
    </div>
  );
}

function SummaryRow({ rowLabel, totalKwh, hddKwh, ssdKwh, carbonFactorKgPerKwh, muted = false, placeholder = false }) {
  const bgClass = muted
    ? 'bg-[#2D6316]/80 dark:bg-[#1e4d0f]'
    : 'bg-[#3A7D1E] dark:bg-[#2d6316]';
  const factor = carbonFactorKgPerKwh ?? 0;
  const totalCo2 = totalKwh * factor;
  const hddCo2 = hddKwh * factor;
  const ssdCo2 = ssdKwh * factor;

  return (
    <div className={`${bgClass} rounded-lg p-4 sm:p-5`}>
      <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-white/70 mb-3">
        {rowLabel}
      </span>
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <SummaryBlock
            label="Total energy"
            value={`${formatKwh(totalKwh)} kWh`}
            placeholder={placeholder}
          />
          <SummaryBlock
            label="Total CO2e"
            value={factor > 0 && !placeholder ? `${totalCo2.toFixed(2)} kg CO₂` : '—'}
            placeholder={placeholder || factor === 0}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SummaryBlock
            label="HDD / year"
            value={`${formatKwh(hddKwh)} kWh`}
            placeholder={placeholder}
            co2Kg={factor > 0 ? hddCo2 : null}
          />
          <SummaryBlock
            label="SSD / year"
            value={`${formatKwh(ssdKwh)} kWh`}
            placeholder={placeholder}
            co2Kg={factor > 0 ? ssdCo2 : null}
          />
        </div>
      </div>
    </div>
  );
}

export default function SummaryTotalsPanel({ before, after, saved, fileCount, carbonFactorKgPerKwh = 0.4361 }) {
  const hasAfter = !!after;

  const avgPct =
    hasAfter && saved
      ? (() => {
          const pctTotal = before.totalKwh > 0 ? (saved.totalKwhSaved / before.totalKwh) * 100 : 0;
          const pctHdd = before.hddKwh > 0 ? (saved.hddKwhSaved / before.hddKwh) * 100 : 0;
          const pctSsd = before.ssdKwh > 0 ? (saved.ssdKwhSaved / before.ssdKwh) * 100 : 0;
          return (pctTotal + pctHdd + pctSsd) / 3;
        })()
      : null;

  const showBadge = hasAfter && avgPct != null && (before.totalKwh > 0 || before.hddKwh > 0 || before.ssdKwh > 0);
  const roundedPct = showBadge ? Math.round(avgPct) : null;

  return (
    <div className="w-full rounded-xl overflow-hidden bg-[#2D6316] dark:bg-[#1A1A2E] shadow-md">
      <div className="p-4 sm:p-5 grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-stretch max-w-5xl mx-auto">
        {/* Before column */}
        <SummaryRow
          rowLabel="Before"
          totalKwh={before.totalKwh}
          hddKwh={before.hddKwh}
          ssdKwh={before.ssdKwh}
          carbonFactorKgPerKwh={carbonFactorKgPerKwh}
          muted
        />

        {/* Middle: % badge */}
        <div className="flex flex-col items-center justify-center px-4 border-x border-white/20">
          {showBadge && roundedPct != null ? (
            <>
              <div className="px-5 py-3 rounded-full bg-white/20 text-white font-bold text-lg sm:text-xl text-center whitespace-nowrap">
                {roundedPct}% less energy
              </div>
              <p className="mt-2 text-xs text-white/80 text-center">
                across all {fileCount} file{fileCount !== 1 ? 's' : ''} converted
              </p>
            </>
          ) : (
            <div className="text-sm text-white/70 text-center">
              Convert files to see savings
            </div>
          )}
        </div>

        {/* After column */}
        <SummaryRow
          rowLabel="After"
          totalKwh={hasAfter ? after.totalKwh : 0}
          hddKwh={hasAfter ? after.hddKwh : 0}
          ssdKwh={hasAfter ? after.ssdKwh : 0}
          carbonFactorKgPerKwh={carbonFactorKgPerKwh}
          muted={false}
          placeholder={!hasAfter}
        />
      </div>
    </div>
  );
}
