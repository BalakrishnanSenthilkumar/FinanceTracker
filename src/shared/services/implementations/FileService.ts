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
    await RNFS.copyFileAssets(assetPath, destPath);
  }

  getDocumentDirectoryPath(): string {
    return RNFS.DocumentDirectoryPath;
  }
}
