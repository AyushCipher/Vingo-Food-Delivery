// Use Vite's built-in env detection - import.meta.env.DEV is true in development
export const serverUrl = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://vingo-backend-194r.onrender.com"
