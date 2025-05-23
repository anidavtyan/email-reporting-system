import * as path from 'path';
import * as fs from 'fs';
import * as fsAsync from 'fs/promises';

/**
 * Resolves the full file path to a template depending on the environment.
 * Uses `src/templates/...` in development and `dist/templates/...` in production.
 *
 * @param subPath Template category directory, e.g., 'email', 'pdf'
 * @param fileName Template file name, e.g., 'daily-report.html'
 * @returns Full absolute file path
 */
export function resolvePath(subPath: string, fileName: string): string {
  const devPath = path.join(process.cwd(), `src/${subPath}`, fileName);
  const prodPath = path.join(__dirname, subPath, fileName);
  return fs.existsSync(devPath) ? devPath : prodPath;
}

/**
 * Generates an absolute path from the project root.
 *
 * @param subPath Path segment relative to project root, e.g., 'samples', 'logs'
 * @returns Full absolute path
 */
export function generatePathInRoot(subPath: string): string {
  return path.join(process.cwd(), subPath);
}

/**
 * Saves a buffer or string to the specified subdirectory under the project root.
 *
 * @param directory Subdirectory name under project root, e.g., 'samples'
 * @param fileName File name to write, e.g., 'report.pdf'
 * @param content File content (Buffer or string)
 * @returns Full path to the written file
 * @throws Error if the file could not be written
 */
export async function saveToDirectory(
  directory: string,
  fileName: string,
  content: Buffer | string,
): Promise<string> {
  const targetDir = generatePathInRoot(directory);
  const filePath = path.join(targetDir, fileName);

  try {
    await fsAsync.mkdir(targetDir, { recursive: true });
    await fsAsync.writeFile(filePath, content);
    return filePath;
  } catch (err: any) {
    throw new Error(`Failed to save file to ${filePath}: ${err.message}`);
  }
}

/**
 * Loads a file (e.g., HTML or TXT) as a UTF-8 string.
 *
 * @param filePath Full path to the file
 * @returns File content as a string
 * @throws Error if the file cannot be read
 */
export async function loadFile(filePath: string): Promise<string> {
  try {
    return await fsAsync.readFile(filePath, 'utf8');
  } catch (err: any) {
    throw new Error(`Failed to load template: ${filePath}\n${err.message}`);
  }
}
