import type { Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const { SITE_DOMAIN } = process.env;

interface IPayloadSetClientCookie {
  token: string;
  refreshToken: string;
}
const PATTERN = /^(https?:\/\/)/i;

const isLocalhost = (domain: string): boolean => {
  const normalized = domain.toLowerCase().replace(PATTERN, '');
  return normalized.includes('localhost');
};

const getDomains = () => {
  const domains = (SITE_DOMAIN || '').split(',')
    .map(domain => domain.trim())
    .filter(domain => !isLocalhost(domain));
    
  if (process.env.ALLOW_LOCALHOST) {
    domains.push('localhost');
  }
  return domains.map(domain => domain.replace(PATTERN, ''));
};

const setCookie = (res: Response, name: string, value: string, domain: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    domain,
    path: '/',
  });
};

const clearCookie = (res: Response, name: string, domain: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    domain,
    path: '/',
  });
};

export const setClientCookie = (res: Response, { token, refreshToken }: IPayloadSetClientCookie) => {
  const domains = getDomains();
  for (const domain of domains) {
    setCookie(res, 'token', token, domain);
    setCookie(res, 'refreshToken', refreshToken, domain);
  }
};

export const removeClientCookie = (res: Response) => {
  const domains = getDomains();
  for (const domain of domains) {
    clearCookie(res, 'token', domain);
    clearCookie(res, 'refreshToken', domain);
  }
};

