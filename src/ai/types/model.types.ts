// Model-related types

export type ModelType = 'gemma-3b' | 'phi-3' | 'custom';

export interface ModelConfig {
  type: ModelType;
  path: string;
  encrypted: boolean;
  version: string;
}

export interface ModelMetadata {
  name: string;
  size: number;
  format: 'tflite' | 'onnx';
  encrypted: boolean;
}
