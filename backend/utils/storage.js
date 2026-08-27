import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

/**
 * Safely read a JSON file
 * @param {string} filename 
 * @param {any} defaultValue 
 * @returns {Promise<any>}
 */
export async function readJson(filename, defaultValue = []) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJson(filename, defaultValue);
      return defaultValue;
    }
    console.error(`Error reading ${filename}:`, error.message);
    return defaultValue;
  }
}

/**
 * Safely write a JSON file
 * @param {string} filename 
 * @param {any} data 
 * @returns {Promise<void>}
 */
export async function writeJson(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, serialized, 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}
