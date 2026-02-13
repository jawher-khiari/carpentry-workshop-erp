const isElectron = typeof window !== 'undefined' && window.location.protocol === 'file:';
const backendServer = isElectron
  ? 'http://localhost:8888/'
  : import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888/';

export const API_BASE_URL =
  isElectron
    ? 'http://localhost:8888/api/'
    : import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote'
      ? backendServer + 'api/'
      : 'http://localhost:8888/api/';

export const BASE_URL =
  isElectron
    ? 'http://localhost:8888/'
    : import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
      ? backendServer
      : 'http://localhost:8888/';

export const WEBSITE_URL = isElectron
  ? 'http://localhost:8888/'
  : import.meta.env.PROD
    ? 'http://cloud.idurarapp.com/'
    : 'http://localhost:3000/';

export const DOWNLOAD_BASE_URL =
  isElectron
    ? 'http://localhost:8888/download/'
    : import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
      ? backendServer + 'download/'
      : 'http://localhost:8888/download/';

export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;
