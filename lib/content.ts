import fs from 'fs';
import path from 'path';

export function readContent(filename: string): string {
  const filepath = path.join(process.cwd(), 'content', filename);
  try {
    return fs.readFileSync(filepath, 'utf-8').trim();
  } catch {
    return '';
  }
}
