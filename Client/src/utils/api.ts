/**
 * Utility to get the API base URL from environment variables or fallback to localhost
 */
export const getApiBaseUrl = (): string => {
  // First check for the environment variable
  const envApiUrl = import.meta.env.VITE_API_URL;
  console.log(envApiUrl);
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Fallback to localhost for development
  return "http://127.0.0.1:8000";
};
