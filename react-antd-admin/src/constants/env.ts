export const ENV = {
  get API_HOST(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  },
  get NODE_ENV(): string {
    return import.meta.env.NODE_ENV || 'development';
  },
};
