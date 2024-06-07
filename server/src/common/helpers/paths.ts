import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPathRelativeToRoot = (filePath: string) =>
  path.join(__dirname, '../../../../', filePath);
