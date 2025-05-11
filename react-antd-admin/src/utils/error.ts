import axios from 'axios';
import { ZodError } from 'zod';

const isZodError = (err: unknown): err is ZodError => {
  return Boolean(err && (err instanceof ZodError || (err as ZodError).name === 'ZodError'));
};

// TODO: FIX ANY TYPE
export const getError = (error: any): string => {
  if (isZodError(error)) {
    console.log('error', error.message);
    return 'Lỗi kiểu dữ liệu!';
  }

  if (axios.isAxiosError(error)) {
    return error.response?.data.message || error.message || 'Lỗi không xác định';
  }
  if (typeof error === 'string') {
    return error;
  }

  return error.message;
};
