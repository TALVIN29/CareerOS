(() => {
const USE_LOCAL_MOCKS = true;
const LOCAL_API_BASE = window.__API_URL__ || 'https://signalpath-demo.local';
const LIVE_API_BASE = 'https://signalpath-backend-service.onrender.com';
const API_BASE = USE_LOCAL_MOCKS ? LOCAL_API_BASE : LIVE_API_BASE;
const API = API_BASE;

function _tok() {
  try {
    const raw = window.__APP_TOKEN__ || '';
    if (!raw) return '';
    try { return atob(raw); }
    catch { return raw; }
  } catch { return ''; }
}

function _headers() {
  const tok = _tok();
  const h = { 'Content-Type': 'application/json' };
  if (tok) {
    if (USE_LOCAL_MOCKS) h['X-Demo-Secret'] = tok;
    else h.Authorization = `Bearer ${tok}`;
  }
  return h;
}

const _apiFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url;
  if (USE_LOCAL_MOCKS || typeof url !== 'string' || !url.startsWith(API_BASE)) {
    return _apiFetch(input, init);
  }

  const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
  const tok = _tok();
  if (tok && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${tok}`);
  return _apiFetch(input, { ...init, headers });
};

window.SignalPathAPI = {
  API,
  API_BASE,
  USE_LOCAL_MOCKS,
  headers: _headers,
  token: _tok,
};
})();
