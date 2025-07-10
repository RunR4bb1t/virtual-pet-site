/**
 * utils.js - Provides common utility functions for frontend operations,
 * including API request handling and token management.
 */

// Define the base URL for API requests.
// This assumes your API endpoints are under '/api'.
// Using window.location.origin ensures it works correctly regardless of deployment URL.
export const API_BASE_URL = `${window.location.origin}/api`;

/**
 * Retrieves the JWT token from localStorage.
 * Assumes the token is stored under the key 'jwtToken'.
 * @returns {string|null} The JWT token if found, otherwise null.
 */
export function getAuthToken() {
  // Using 'jwtToken' for consistency with login.js and dashboard.js
  return localStorage.getItem('jwtToken');
}

/**
 * Makes an authenticated API request to the backend.
 * @param {string} path - The specific API endpoint path (e.g., '/users/profile').
 * @param {object} [options] - Optional configuration for the fetch request.
 * @param {string} [options.method='GET'] - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [options.body] - The request body for POST/PUT requests (will be JSON.stringified).
 * @param {boolean} [options.expectJson=true] - Whether to attempt parsing the response as JSON.
 * @returns {Promise<object|Response>} - Resolves with JSON data, or the raw Response object if expectJson is false.
 * @throws {Error} If the network request fails or the server returns a non-2xx status code.
 */
export async function apiRequest(path, { method = 'GET', body, expectJson = true } = {}) {
  const headers = {
    // Default content type for JSON payloads
    'Content-Type': 'application/json'
  };

  const token = getAuthToken();
  if (token) {
    // Add Authorization header if a token exists
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      // Only include body for methods that typically have one
      body: body ? JSON.stringify(body) : undefined
    });

    // Check if the response status is not OK (i.e., 4xx or 5xx)
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      let errorDetails = {};

      try {
        // Attempt to parse error response as JSON for more details
        errorDetails = await response.json();
        // If the backend sends a specific 'message' field in error responses
        if (errorDetails.message) {
          errorMessage = errorDetails.message;
        } else if (errorDetails.error && errorDetails.error.message) {
          errorMessage = errorDetails.error.message;
        }
      } catch (jsonError) {
        // If response is not JSON or parsing fails, use generic message
        console.warn('Non-JSON error response received or failed to parse:', jsonError);
      }
      // Throw an error with the detailed message
      throw new Error(errorMessage);
    }

    // If expectJson is false, return the raw response (e.g., for logout or 204 No Content)
    if (!expectJson && response.status === 204) { // Handle 204 No Content explicitly
        return {}; // Return an empty object for consistency if no content expected
    }
    if (!expectJson) {
        return response;
    }

    // Attempt to parse JSON response
    return await response.json();

  } catch (error) {
    // Re-throw the error to be caught by the calling function (e.g., in login.js or dashboard.js)
    console.error('API request failed:', error.message);
    throw error;
  }
}