import RNFS from 'react-native-fs';
import { IFileService } from '../interfaces/IFileService';

/**
 * Implementation of IFileService using react-native-fs
 */
export class FileService implements IFileService {
  async exists(path: string): Promise<boolean> {
    return await RNFS.exists(path);
  }

  async copyFileAssets(assetPath: string, destPath: string): Promise<void> {
    try {
      await RNFS.copyFileAssets(assetPath, destPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while copying file';
      throw new Error(
        `Failed to copy asset file "${assetPath}" to "${destPath}": ${errorMessage}. Please ensure the file exists in the assets folder.`,
      );
    }
  }

  getDocumentDirectoryPath(): string {
    return RNFS.DocumentDirectoryPath;
  }
}
