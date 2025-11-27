import { Platform } from 'react-native';
import { initLlama } from 'llama.rn';
import {
  IModelService,
  ModelConfig,
  ModelContext,
  CompletionConfig,
  CompletionResult,
  TokenCallback,
} from '../interfaces/IModelService';
import { IFileService } from '../../../shared/services/interfaces/IFileService';

/**
 * Wrapper for llama.rn ModelContext to match our interface
 */
class LlamaModelContext implements ModelContext {
  constructor(private llamaContext: any) {}

  async completion(
    config: CompletionConfig,
    callback?: TokenCallback,
  ): Promise<CompletionResult> {
    return await this.llamaContext.completion(config, callback);
  }
}

/**
 * Implementation of IModelService using llama.rn
 */
export class LlamaModelService implements IModelService {
  constructor(private fileService: IFileService) {}

  async initializeModel(config: ModelConfig): Promise<ModelContext> {
    const llamaContext = await initLlama({
      model: config.model,
      use_mlock: config.use_mlock ?? false,
      n_ctx: config.n_ctx ?? 2048,
      n_gpu_layers: config.n_gpu_layers ?? 0,
      embedding: config.embedding,
    });

    return new LlamaModelContext(llamaContext);
  }

  async getModelPath(filename: string): Promise<string> {
    if (Platform.OS === 'android') {
      // For Android, we need to copy the asset to a writable location first
      const assetPath = `models/${filename}`;
      const destPath = `${this.fileService.getDocumentDirectoryPath()}/${filename}`;

      // Check if file already exists
      const fileExists = await this.fileService.exists(destPath);

      if (!fileExists) {
        console.log('Copying model from assets to:', destPath);
        // Copy from assets to documents directory
        await this.fileService.copyFileAssets(assetPath, destPath);
        console.log('Model copied successfully');
      } else {
        console.log('Model already exists at:', destPath);
      }

      return destPath;
    } else {
      // For iOS, use the path directly from bundle
      return `models/${filename}`;
    }
  }
}
