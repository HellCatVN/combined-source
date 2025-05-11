import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateBmConfigs = () => {
  const configsDir = path.join(process.cwd(), 'src', 'bm', 'configs');
  if (!fs.existsSync(configsDir)) {
    fs.mkdirSync(configsDir, { recursive: true });
  }

  // Generate index.ts
  const indexContent = `export * from './menuData';

export const customConfig = {
  siteName: 'Admin-Dashboard',
};
`;

  // Generate menuData.tsx
  const menuDataContent = `export const customMenuData = [
  // {
  //   path: '/admin/sample',
  //   name: 'Sample',
  //   icon: <FileProtectOutlined />,
  //   roles: ['admin', 'moderator', 'user'],
  // },
];
`;

  fs.writeFileSync(path.join(configsDir, 'index.ts'), indexContent);
  fs.writeFileSync(path.join(configsDir, 'menuData.tsx'), menuDataContent);

  console.log('Generated bm configs files successfully!');
};