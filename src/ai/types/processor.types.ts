// Processor types

export interface ProcessorConfig {
  name: string;
  priority?: number;
}

export interface ProcessResult {
  success: boolean;
  data?: any;
  error?: string;
}
