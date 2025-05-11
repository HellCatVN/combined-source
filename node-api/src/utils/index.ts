export * from './logger';
export * from './validatorObject';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
    if (value === null) {
      return true;
    } else if (typeof value !== 'number' && value === '') {
      return true;
    } else if (typeof value === undefined || value === undefined) {
      return true;
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
      return true;
    } else {
      return false;
    }
  };
  
export const genKey = (): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const keyLength = 6;
  let key: string = '';
  for (var i = 0; i <= keyLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    key += chars.substring(randomNumber, randomNumber + 1);
  }
  return key;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * @method toContainerName
 * @param {string} pluginName - The plugin folder name (e.g., 'sync-source')
 * @returns {string} - The container name (e.g., 'syncSourceContainer')
 * @description Converts a kebab-case plugin folder name to a camelCase container name
 */
export const toContainerName = (pluginName: string): string => {
  return pluginName
    .split('-')
    .map((part, index) => 
      index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join('') + 'Container';
};