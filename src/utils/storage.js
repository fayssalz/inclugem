import { INITIAL_INCLUSIONS } from '../data/initialInclusions';

const STORAGE_KEY = 'hyperion_gem_inclusions_db_v1';

export function getStoredInclusions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) {
      const initial = Array.isArray(INITIAL_INCLUSIONS) ? INITIAL_INCLUSIONS : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : (INITIAL_INCLUSIONS || []);
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return Array.isArray(INITIAL_INCLUSIONS) ? INITIAL_INCLUSIONS : [];
  }
}

export function saveStoredInclusions(inclusions) {
  try {
    if (Array.isArray(inclusions)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inclusions));
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function resetStoredInclusions() {
  try {
    const initial = Array.isArray(INITIAL_INCLUSIONS) ? INITIAL_INCLUSIONS : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.error('Failed to reset storage:', err);
    return Array.isArray(INITIAL_INCLUSIONS) ? INITIAL_INCLUSIONS : [];
  }
}

const IMGBB_KEY_STORAGE = 'hyperion_imgbb_api_key';
const GOOGLE_SHEET_URL_STORAGE = 'hyperion_google_sheet_url';
const CLOUDFLARE_WORKER_URL_STORAGE = 'hyperion_cloudflare_worker_url';
const STORAGE_PROVIDER_KEY = 'hyperion_storage_provider';

export function getImgBBApiKey() {
  return localStorage.getItem(IMGBB_KEY_STORAGE) || '';
}

export function setImgBBApiKey(key) {
  localStorage.setItem(IMGBB_KEY_STORAGE, (key || '').trim());
}

export function getGoogleSheetUrl() {
  return localStorage.getItem(GOOGLE_SHEET_URL_STORAGE) || '';
}

export function setGoogleSheetUrl(url) {
  localStorage.setItem(GOOGLE_SHEET_URL_STORAGE, (url || '').trim());
}

export function getCloudflareWorkerUrl() {
  return localStorage.getItem(CLOUDFLARE_WORKER_URL_STORAGE) || '';
}

export function setCloudflareWorkerUrl(url) {
  localStorage.setItem(CLOUDFLARE_WORKER_URL_STORAGE, (url || '').trim());
}

export function getStorageProvider() {
  // Default to 'cloudflare' (Cloudflare D1 + R2) as primary engine
  return localStorage.getItem(STORAGE_PROVIDER_KEY) || 'cloudflare'; // 'cloudflare' | 'local' | 'sheet'
}

export function setStorageProvider(provider) {
  localStorage.setItem(STORAGE_PROVIDER_KEY, provider);
}
