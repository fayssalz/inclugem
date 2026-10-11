/**
 * Uploads an image (File or base64 Data URL) to the ImgBB API.
 *
 * @param {File|string} imageFileOrBase64 - The file object or base64 string to upload.
 * @param {string} apiKey - The user's ImgBB API Key.
 * @returns {Promise<{ imageUrl: string, thumbUrl: string, deleteUrl: string }>}
 */
export async function uploadToImgBB(imageFileOrBase64, apiKey) {
  if (!apiKey) {
    throw new Error('ImgBB API Key is missing. Please enter your ImgBB API Key in Settings.');
  }

  const formData = new FormData();

  if (typeof imageFileOrBase64 === 'string' && imageFileOrBase64.startsWith('data:image')) {
    // Strip data header to send clean base64 string
    const base64Data = imageFileOrBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    formData.append('image', base64Data);
  } else if (imageFileOrBase64 instanceof File) {
    formData.append('image', imageFileOrBase64);
  } else {
    // If it's already an http/https URL, return it directly
    if (typeof imageFileOrBase64 === 'string' && /^https?:\/\//i.test(imageFileOrBase64)) {
      return {
        imageUrl: imageFileOrBase64,
        thumbUrl: imageFileOrBase64,
        deleteUrl: ''
      };
    }
    throw new Error('Invalid image file format provided for ImgBB upload.');
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    body: formData
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `ImgBB upload failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    imageUrl: json.data.url,
    thumbUrl: json.data.display_url || json.data.thumb?.url || json.data.url,
    deleteUrl: json.data.delete_url || ''
  };
}
