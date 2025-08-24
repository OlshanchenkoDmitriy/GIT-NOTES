export type OperationType = 
  | 'removeCharacters'
  | 'regexReplace'
  | 'changeCase'
  | 'deduplicate'
  | 'removeEmptyLines'
  | 'trimWhitespace'
  | 'addPrefixSuffix';

export interface Operation {
  id: string;
  type: OperationType;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface Preset {
  id: string;
  name: string;
  operations: Operation[];
  createdAt: Date;
}

export type CaseType = 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';

export interface TextProcessingState {
  originalText: string;
  processedText: string;
  operations: Operation[];
  currentPreset?: Preset;
}