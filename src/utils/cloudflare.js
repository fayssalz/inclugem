/**
 * Utility functions for interacting with Cloudflare Worker / Pages API (D1 Database + R2 Storage)
 */

/**
 * Gets the effective base API URL.
 * If workerUrl is set, uses workerUrl. Otherwise defaults to relative '/api' (for Cloudflare Pages).
 *
 * @param {string} [workerUrl]
 * @returns {string}
 */
export function getApiBaseUrl(workerUrl) {
  if (workerUrl && workerUrl.trim()) {
    let url = workerUrl.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }
  return '/api';
}

/**
 * Fetches inclusion records from Cloudflare D1 via Worker API.
 *
 * @param {string} [workerUrl]
 * @returns {Promise<Array>}
 */
export async function fetchFromCloudflare(workerUrl) {
  const baseUrl = getApiBaseUrl(workerUrl);
  const endpoint = `${baseUrl}/inclusions`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Cloudflare API request failed (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch records from Cloudflare D1.');
  }

  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Saves or deletes an inclusion record in Cloudflare D1.
 *
 * @param {string} workerUrl
 * @param {Object} record
 * @param {'save'|'delete'} [action='save']
 * @returns {Promise<Object>}
 */
export async function saveToCloudflare(workerUrl, record, action = 'save') {
  const baseUrl = getApiBaseUrl(workerUrl);
  const endpoint = `${baseUrl}/inclusions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      record,
      id: record.id
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Cloudflare save failed (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Cloudflare D1 save action failed.');
  }

  return json;
}

/**
 * Uploads an image (File or base64 Data URL) to Cloudflare R2 bucket via Worker API.
 *
 * @param {File|string} imageFileOrBase64
 * @param {string} [workerUrl]
 * @returns {Promise<{ imageUrl: string, thumbUrl: string, key: string }>}
 */
export async function uploadToCloudflareR2(imageFileOrBase64, workerUrl) {
  const baseUrl = getApiBaseUrl(workerUrl);
  const endpoint = `${baseUrl}/upload`;

  let bodyData;
  let headers = {};

  if (typeof imageFileOrBase64 === 'string' && imageFileOrBase64.startsWith('data:image')) {
    bodyData = JSON.stringify({
      image: imageFileOrBase64,
      filename: `inc-${Date.now()}.png`
    });
    headers['Content-Type'] = 'application/json';
  } else if (imageFileOrBase64 instanceof File) {
    const formData = new FormData();
    formData.append('image', imageFileOrBase64);
    bodyData = formData;
  } else if (typeof imageFileOrBase64 === 'string' && /^https?:\/\//i.test(imageFileOrBase64)) {
    // Already an external URL
    return {
      imageUrl: imageFileOrBase64,
      thumbUrl: imageFileOrBase64,
      key: ''
    };
  } else {
    throw new Error('Invalid image data for Cloudflare R2 upload.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: bodyData
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Cloudflare R2 upload failed (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'R2 Image upload failed.');
  }

  // Ensure absolute URL if relative path returned and workerUrl is specified
  let imageUrl = json.imageUrl;
  let thumbUrl = json.thumbUrl || json.imageUrl;

  if (workerUrl && imageUrl.startsWith('/')) {
    const origin = new URL(workerUrl.startsWith('http') ? workerUrl : `https://${workerUrl}`).origin;
    imageUrl = `${origin}${imageUrl}`;
    thumbUrl = `${origin}${thumbUrl}`;
  }

  return {
    imageUrl,
    thumbUrl,
    key: json.key || ''
  };
}

/**
 * Tests connection to Cloudflare Worker API.
 *
 * @param {string} workerUrl
 * @returns {Promise<{ success: boolean, count: number, message: string }>}
 */
export async function testCloudflareConnection(workerUrl) {
  try {
    const records = await fetchFromCloudflare(workerUrl);
    return {
      success: true,
      count: records.length,
      message: `Successfully connected to Cloudflare! D1 contains ${records.length} inclusion records.`
    };
  } catch (err) {
    return {
      success: false,
      count: 0,
      message: `Connection test failed: ${err.message}`
    };
  }
}
