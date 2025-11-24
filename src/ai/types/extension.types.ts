// Extension point types

export interface ExtensionConfig {
  name: string;
  version: string;
  enabled: boolean;
}

export interface Strategy {
  execute(...args: any[]): Promise<any>;
}

export interface Source {
  generate(...args: any[]): Promise<any>;
}
