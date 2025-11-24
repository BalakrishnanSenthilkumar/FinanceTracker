/**
 * Default LLM models for the Finance Tracker app
 * Models are hosted remotely and downloaded on-demand
 * Based on react-native-executorch predefined models
 */

import {
  LLAMA3_2_1B_SPINQUANT,
  QWEN3_0_6B_QUANTIZED,
  LLAMA3_2_1B_QLORA,
} from 'react-native-executorch';

export interface ModelConfig {
  id: string;
  modelName: string;
  modelPath: string;
  tokenizerPath: string;
  tokenizerConfigPath: string;
  source: 'remote' | 'local';
  parameters: number; // in billions
  modelSize: number; // in GB
  labels: string[];
  description: string;
}

/**
 * Recommended models for Finance Tracker
 * Sorted by recommended usage (smallest/fastest first)
 */
export const FINANCE_MODELS: ModelConfig[] = [
  {
    id: 'llama-1b-spinquant',
    modelName: 'LLaMA 3.2 - 1B - SpinQuant',
    modelPath: LLAMA3_2_1B_SPINQUANT.modelSource,
    tokenizerPath: LLAMA3_2_1B_SPINQUANT.tokenizerSource,
    tokenizerConfigPath: LLAMA3_2_1B_SPINQUANT.tokenizerConfigSource,
    source: 'remote',
    parameters: 1.24,
    modelSize: 1.14,
    labels: ['Fast', 'Recommended', 'Quantized', 'Good at coding'],
    description:
      'Fast and efficient model, perfect for quick responses. Great for financial advice and calculations.',
  },
  {
    id: 'qwen-0.6b-quantized',
    modelName: 'Qwen 3 - 0.6B - Quantized',
    modelPath: QWEN3_0_6B_QUANTIZED.modelSource,
    tokenizerPath: QWEN3_0_6B_QUANTIZED.tokenizerSource,
    tokenizerConfigPath: QWEN3_0_6B_QUANTIZED.tokenizerConfigSource,
    source: 'remote',
    parameters: 0.75,
    modelSize: 0.94,
    labels: ['Very Fast', 'Smallest', 'Quantized', 'Reasoning'],
    description:
      'Smallest and fastest model. Ideal for devices with limited resources.',
  },
  {
    id: 'llama-1b-qlora',
    modelName: 'LLaMA 3.2 - 1B - QLoRa',
    modelPath: LLAMA3_2_1B_QLORA.modelSource,
    tokenizerPath: LLAMA3_2_1B_QLORA.tokenizerSource,
    tokenizerConfigPath: LLAMA3_2_1B_QLORA.tokenizerConfigSource,
    source: 'remote',
    parameters: 1.24,
    modelSize: 1.18,
    labels: ['Good at coding', 'Quantized'],
    description:
      'Well-balanced model with good performance for financial analysis and calculations.',
  },
];

/**
 * Get default/recommended model
 */
export const getDefaultModel = (): ModelConfig => {
  return FINANCE_MODELS[0]; // LLaMA 3.2 1B SpinQuant
};

/**
 * Get model by ID
 */
export const getModelById = (id: string): ModelConfig | undefined => {
  return FINANCE_MODELS.find(model => model.id === id);
};
