import fs from 'fs';
import path from 'path';

export const generateBmApi = () => {
  // Create directories if they don't exist
  const createDirIfNotExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  // Create the bm/api directory structure
  const bmApiPath = path.join('src', 'bm', 'api');
  createDirIfNotExists(bmApiPath);

  // Create config.ts
  const configContent = `export const customAPIConfigs = {
  // sample: {
  //   url: '/sample',
  // },
};`;

  fs.writeFileSync(path.join(bmApiPath, 'config.ts'), configContent);

  // Create index.ts
  const indexContent = `export * from './config';`;

  fs.writeFileSync(path.join(bmApiPath, 'index.ts'), indexContent);

  console.log('BM API files generated successfully!');
};