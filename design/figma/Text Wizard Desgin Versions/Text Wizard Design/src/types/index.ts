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
  collapsed?: boolean;
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

// Новые типы для системы истории
export interface HistoryState {
  originalText: string;
  operations: Operation[];
  timestamp: number;
  description: string;
}

export interface AppState {
  originalText: string;
  processedText: string;
  operations: Operation[];
  presets: Preset[];
  previewUpTo: string | null;
  history: HistoryState[];
  currentHistoryIndex: number;
}

// Типы для тостов
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Типы для статистики текста
export interface TextStats {
  characters: number;
  charactersWithoutSpaces: number;
  lines: number;
  words: number;
}