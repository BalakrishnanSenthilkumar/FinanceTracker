import { create } from 'zustand';
import { ResourceFetcher } from 'react-native-executorch';
import type { ModelConfig } from '../constants/default-models';

export enum ModelDownloadState {
  NotStarted = 'not_started',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
  Error = 'error',
}

interface DownloadProgress {
  modelId: string;
  progress: number; // 0 to 1
  status: ModelDownloadState;
}

interface ModelStore {
  downloadProgress: Record<string, DownloadProgress>;
  downloadedModels: Set<string>;

  downloadModel: (model: ModelConfig) => Promise<void>;
  cancelDownload: (model: ModelConfig) => Promise<void>;
  isModelDownloaded: (modelId: string) => boolean;
  getDownloadProgress: (modelId: string) => DownloadProgress | null;
}

const MS_PER_FRAME = 16; // ~60 fps for smooth progress updates

export const useModelStore = create<ModelStore>((set, get) => ({
  downloadProgress: {},
  downloadedModels: new Set<string>(),

  downloadModel: async (model: ModelConfig) => {
    const setProgress = (progress: number, status: ModelDownloadState) => {
      set(state => ({
        downloadProgress: {
          ...state.downloadProgress,
          [model.id]: { modelId: model.id, progress, status },
        },
      }));
    };

    let lastReportedPercent = -1;
    let lastReportTime = Date.now();
    let downloadDone = false;

    setProgress(0, ModelDownloadState.Downloading);

    try {
      console.log(`Starting download for ${model.modelName}...`);

      // Check if ResourceFetcher is available
      if (!ResourceFetcher || !ResourceFetcher.fetch) {
        throw new Error(
          'Native module not linked. Please rebuild the app:\n' +
            'iOS: cd ios && pod install && cd .. && yarn ios\n' +
            'Android: yarn android',
        );
      }

      const result = await ResourceFetcher.fetch(
        (p: number) => {
          const currentPercent = Math.floor(p * 100);
          if (
            !downloadDone &&
            currentPercent !== lastReportedPercent &&
            lastReportTime + MS_PER_FRAME < Date.now()
          ) {
            lastReportedPercent = currentPercent;
            lastReportTime = Date.now();
            setProgress(p, ModelDownloadState.Downloading);
          }
        },
        model.modelPath,
        model.tokenizerPath,
        model.tokenizerConfigPath,
      );

      if (result === null) {
        throw new Error('Download cancelled');
      }

      downloadDone = true;
      setProgress(1, ModelDownloadState.Downloaded);

      // Mark as downloaded
      set(state => ({
        downloadedModels: new Set(state.downloadedModels).add(model.id),
      }));

      console.log(`✅ ${model.modelName} downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      setProgress(0, ModelDownloadState.Error);
      throw error;
    }
  },

  cancelDownload: async (model: ModelConfig) => {
    try {
      await ResourceFetcher.cancelFetching(
        model.modelPath,
        model.tokenizerPath,
        model.tokenizerConfigPath,
      );

      set(state => ({
        downloadProgress: {
          ...state.downloadProgress,
          [model.id]: {
            modelId: model.id,
            progress: 0,
            status: ModelDownloadState.NotStarted,
          },
        },
      }));
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  },

  isModelDownloaded: (modelId: string) => {
    return get().downloadedModels.has(modelId);
  },

  getDownloadProgress: (modelId: string) => {
    return get().downloadProgress[modelId] || null;
  },
}));
