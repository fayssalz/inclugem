/**
 * Initial static gem inclusion database.
 * Used as default dataset for local storage and database resets.
 */
export const INITIAL_INCLUSIONS = [

];

/**
 * Example function to fetch inclusions from an API endpoint.
 *
 * @param {string} apiUrl - The URL of your backend API endpoint.
 * @returns {Promise<Array>} A promise that resolves to the array of inclusions.
 */
export async function fetchInclusions(apiUrl = 'http://192.168.22.135:3001/api/inclusions') {
  try {
    const response = await fetch(apiUrl);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch inclusions:', error);
    return INITIAL_INCLUSIONS; // Return fallback default inclusions on error
  }
}

