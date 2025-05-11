import i18next from 'i18next';
import * as fs from 'fs';
import * as path from 'path';

class I18nService {
  private static instance: I18nService;
  private translationCache: { [key: string]: any } = {};

  private constructor() {
    this.initializeI18n();
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  private loadTranslations(): { [key: string]: any } {
    const localesPath = path.join(__dirname, '../locales');
    const resources: { [key: string]: any } = {};

    // Read all JSON files from locales directory
    fs.readdirSync(localesPath)
      .filter(file => file.endsWith('.json'))
      .forEach(file => {
        const language = path.basename(file, '.json');
        const filePath = path.join(localesPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        try {
          resources[language] = {
            translation: JSON.parse(fileContent)
          };
          // Cache the translations
          this.translationCache[language] = resources[language];
        } catch (error) {
          console.error(`Error loading translation file ${file}:`, error);
        }
      });

    return resources;
  }

  private async initializeI18n() {
    const resources = this.loadTranslations();
    const languages = Object.keys(resources);

    await i18next.init({
      lng: 'en', // default language
      fallbackLng: 'en',
      resources,
      interpolation: {
        escapeValue: false
      }
    });

  }

  public setLanguage(language: string) {
    i18next.changeLanguage(language);
  }

  public translate(key: string, options?: object): string {
    return i18next.t(key, options);
  }

  // Method to get all supported languages
  public getSupportedLanguages(): string[] {
    return Object.keys(this.translationCache);
  }

  // Method to reload translations (useful when new files are added)
  public reloadTranslations() {
    const resources = this.loadTranslations();
    Object.keys(resources).forEach(lang => {
      i18next.addResourceBundle(lang, 'translation', resources[lang].translation, true, true);
    });
  }
}

export default I18nService;