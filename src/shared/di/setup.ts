/**
 * Dependency Injection Setup
 * Configures all services and their dependencies
 */
import { container, ServiceIdentifiers } from './Container';
import { FileService } from '../../shared/services/implementations/FileService';
import { LlamaModelService } from '../../modules/genai/implementations/LlamaModelService';
import { IFileService } from '../../shared/services/interfaces/IFileService';
import { IModelService } from '../../modules/genai/interfaces/IModelService';

/**
 * Initialize and register all services with the DI container
 * This should be called once at app startup
 */
export function setupDependencies(): void {
  // Register FileService as singleton
  container.register<IFileService>(
    ServiceIdentifiers.FileService,
    () => new FileService(),
    true, // singleton
  );

  // Register ModelService as singleton
  // ModelService depends on FileService, so we resolve it from the container
  container.register<IModelService>(
    ServiceIdentifiers.ModelService,
    () => {
      const fileService = container.resolve<IFileService>(
        ServiceIdentifiers.FileService,
      );
      return new LlamaModelService(fileService);
    },
    true, // singleton
  );
}
