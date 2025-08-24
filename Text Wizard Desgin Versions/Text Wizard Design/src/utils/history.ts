import { HistoryState, Operation } from '../types';

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  constructor(maxSize = 50) {
    this.maxHistorySize = maxSize;
  }

  pushState(originalText: string, operations: Operation[], description: string): void {
    // Удаляем все состояния после текущего индекса (при создании новой ветки)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    const newState: HistoryState = {
      originalText,
      operations: JSON.parse(JSON.stringify(operations)), // глубокое копирование
      timestamp: Date.now(),
      description
    };

    this.history.push(newState);
    this.currentIndex++;

    // Ограничиваем размер истории
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): HistoryState | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.getCurrentState();
    }
    return null;
  }

  redo(): HistoryState | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.getCurrentState();
    }
    return null;
  }

  getCurrentState(): HistoryState | null {
    return this.history[this.currentIndex] || null;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistoryInfo(): { current: number; total: number; canUndo: boolean; canRedo: boolean } {
    return {
      current: this.currentIndex + 1,
      total: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
}