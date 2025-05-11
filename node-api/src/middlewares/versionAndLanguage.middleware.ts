import { Request, Response, NextFunction } from 'express';
import I18nService from '@services/i18n.service';
import '../types/interfaces/express.interface';

export interface VersionConfig {
  supported: string[];
  default: string;
}

const versionConfig: VersionConfig = {
  supported: ['en', 'vi'],
  default: 'v1'
};

export const versionAndLanguageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const i18nService = I18nService.getInstance();
  const supportedLanguages = i18nService.getSupportedLanguages();
  // Extract version and language from URL
  let version = req.params.version;
  let language = req.params.language;
  
  // Validate and set version
  if (!version || !versionConfig.supported.includes(version)) {
    version = versionConfig.default;
  }
  
  // Validate and set language
  if (!language || !supportedLanguages.includes(language)) {
    language = supportedLanguages[0] || 'en';
  }
  
  // Set language for i18n
  i18nService.setLanguage(language);
  
  // Add version and language to request object
  req.apiVersion = version;
  req.language = language;
  next();
};

export const getVersionConfig = () => versionConfig;