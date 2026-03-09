const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Start conversion: POST file, get job_id.
 * @param {File} file
 * @param {{ webpQuality?: number, webmCrf?: number }} [options]
 * @returns {Promise<{ job_id: string }>}
 */
export async function startConvert(file, options = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('webp_quality', String(options.webpQuality ?? 85));
  form.append('webm_crf', String(options.webmCrf ?? 33));
  const res = await fetch(`${API_BASE}/convert`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Conversion failed');
  }
  return res.json();
}

/**
 * Poll conversion status.
 * @param {string} jobId
 * @returns {Promise<{ progress: number, done: boolean, error?: string, filename?: string }>}
 */
export async function getConvertStatus(jobId) {
  const res = await fetch(`${API_BASE}/convert/status/${jobId}`);
  if (!res.ok) throw new Error('Status failed');
  return res.json();
}

/**
 * Fetch converted file blob (when done).
 * @param {string} jobId
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function getConvertResult(jobId) {
  const res = await fetch(`${API_BASE}/convert/result/${jobId}`);
  if (!res.ok) throw new Error(res.status === 202 ? 'Not ready' : 'Fetch failed');
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  let filename = 'converted.webp';
  if (disposition) {
    const m = disposition.match(/filename="?([^";]+)"?/);
    if (m) filename = m[1].trim();
  }
  return { blob, filename };
}

/**
 * Poll until conversion is done, then return result.
 * @param {string} jobId
 * @param {(progress: number) => void} onProgress
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function convertWithProgress(jobId, onProgress) {
  const poll = async () => {
    const st = await getConvertStatus(jobId);
    onProgress(st.progress);
    if (st.done) {
      if (st.error) throw new Error(st.error);
      const { blob, filename: headerFilename } = await getConvertResult(jobId);
      const filename = st.filename || headerFilename;
      return { blob, filename };
    }
    await new Promise((r) => setTimeout(r, 300));
    return poll();
  };
  return poll();
}
