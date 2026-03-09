import { useMemo } from 'react';
import {
  FIXED_KWH_PER_GB,
  CELLULAR_KWH_PER_GB,
  HDD_KWH_PER_TB_MONTH,
  SSD_KWH_PER_TB_MONTH,
  MONTHS_PER_YEAR,
} from '../utils/emissions';

export function useEmissionsData(files, results, estimatedViews, fixedLinePercent) {
  const cellularPercent = 100 - fixedLinePercent;

  return useMemo(() => {
    const beforeTotalBytes = files.reduce((sum, f) => sum + f.file.size, 0);
    const afterTotalBytes = Object.values(results).reduce((sum, r) => sum + r.newSize, 0);
    const hasAfter = Object.keys(results).length > 0;

    const fixedViews = estimatedViews * (fixedLinePercent / 100);
    const cellularViews = estimatedViews * (cellularPercent / 100);

    const beforeGB = beforeTotalBytes / 1e9;
    const beforeTB = beforeTotalBytes / 1e12;
    const beforeFixedKwh = beforeGB * fixedViews * FIXED_KWH_PER_GB;
    const beforeCellularKwh = beforeGB * cellularViews * CELLULAR_KWH_PER_GB;
    const beforeHddKwh = beforeTB * HDD_KWH_PER_TB_MONTH * MONTHS_PER_YEAR;
    const beforeSsdKwh = beforeTB * SSD_KWH_PER_TB_MONTH * MONTHS_PER_YEAR;
    const beforeTotalKwh = beforeFixedKwh + beforeCellularKwh;

    let afterFixedKwh = 0;
    let afterCellularKwh = 0;
    let afterHddKwh = 0;
    let afterSsdKwh = 0;
    let afterTotalKwh = 0;
    const afterGB = hasAfter ? afterTotalBytes / 1e9 : 0;
    const afterTB = hasAfter ? afterTotalBytes / 1e12 : 0;
    if (hasAfter) {
      afterFixedKwh = afterGB * fixedViews * FIXED_KWH_PER_GB;
      afterCellularKwh = afterGB * cellularViews * CELLULAR_KWH_PER_GB;
      afterHddKwh = afterTB * HDD_KWH_PER_TB_MONTH * MONTHS_PER_YEAR;
      afterSsdKwh = afterTB * SSD_KWH_PER_TB_MONTH * MONTHS_PER_YEAR;
      afterTotalKwh = afterFixedKwh + afterCellularKwh;
    }

    const beforeKB = beforeTotalBytes / 1024;
    const afterKB = hasAfter ? afterTotalBytes / 1024 : 0;
    const sizeSavedKB = hasAfter ? beforeKB - afterKB : 0;
    const sizeSavedPercent = hasAfter && beforeKB > 0 ? ((sizeSavedKB / beforeKB) * 100).toFixed(1) : null;

    return {
      before: {
        totalKb: beforeTotalBytes,
        fixedKwh: beforeFixedKwh,
        cellularKwh: beforeCellularKwh,
        hddKwh: beforeHddKwh,
        ssdKwh: beforeSsdKwh,
        totalKwh: beforeTotalKwh,
      },
      after: hasAfter
        ? {
            totalKb: afterTotalBytes,
            fixedKwh: afterFixedKwh,
            cellularKwh: afterCellularKwh,
            hddKwh: afterHddKwh,
            ssdKwh: afterSsdKwh,
            totalKwh: afterTotalKwh,
          }
        : null,
      saved: hasAfter
        ? {
            sizeSavedKB,
            sizeSavedPercent,
            fixedKwhSaved: beforeFixedKwh - afterFixedKwh,
            cellularKwhSaved: beforeCellularKwh - afterCellularKwh,
            hddKwhSaved: beforeHddKwh - afterHddKwh,
            ssdKwhSaved: beforeSsdKwh - afterSsdKwh,
            totalKwhSaved: beforeTotalKwh - afterTotalKwh,
          }
        : null,
    };
  }, [files, results, estimatedViews, fixedLinePercent, cellularPercent]);
}
