/**
 * Interface for file system operations
 * Abstracts file operations to allow for easy testing and swapping implementations
 */
export interface IFileService {
  /**
   * Check if a file exists at the given path
   */
  exists(path: string): Promise<boolean>;

  /**
   * Copy a file from assets to a writable location
   * @param assetPath Path to the asset file (relative to assets folder)
   * @param destPath Destination path where the file should be copied
   */
  copyFileAssets(assetPath: string, destPath: string): Promise<void>;

  /**
   * Get the document directory path
   */
  getDocumentDirectoryPath(): string;
}
