/**
 * Fonction centralisée pour tous les fetch API
 * Utilise la config compilée lors du build
 */

import config from '../config';

const getApiBaseUrl = () => {
  return config.apiBaseUrl;
};

export const fetchAPI = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error from ${url}:`, error);
    throw error;
  }
};

export default fetchAPI;
