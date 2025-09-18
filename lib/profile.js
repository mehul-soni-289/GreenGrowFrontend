// Converted from TypeScript: removed interfaces

const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Fetches the personal profile data for the currently authenticated user.
 */
export async function getPersonalProfile() {
  console.log(`Fetching current user's profile...`);

  const response = await fetch(`${API_BASE_URL}/me/`, {
    // Include credentials (cookies) in the request
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // You might want to handle different status codes differently (e.g., 401 for unauthorized)
    throw new Error("Failed to fetch personal profile data.");
  }

  // It's a good practice to ensure the response matches your interface.
  const data = await response.json();
  return data;
}

/**
 * Fetches the organization profile data from the API.
 * @param orgId - The ID of the organization to fetch.
 */
export async function getOrganizationProfile(orgId) {
  console.log(`Fetching organization profile for org: ${orgId}...`);

  // IMPORTANT: Replace this with your actual endpoint for organizations
  const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization profile data.");
  }

  const data = await response.json();
  return data;
}

/**
 * Updates the organization profile data on the server.
 * @param orgId - The ID of the organization to update.
 * @param data - The new profile data to be saved.
 */
export async function updateOrganizationProfile(orgId, data) {
  console.log(`Updating organization profile for org: ${orgId}...`, data);

  const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
    method: "PUT", // or 'PATCH'
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update organization profile");
  }

  return response.json();
}

/**
 * Updates the personal profile data on the server.
 * @param data - The new profile data.
 */
export async function updatePersonalProfile(data) {
  console.log(`Updating personal profile for user...`, data);

  const response = await fetch(`${API_BASE_URL}/me/`, {
    method: "PUT", // or 'PATCH'
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update personal profile");
  }

  return response.json();
}
