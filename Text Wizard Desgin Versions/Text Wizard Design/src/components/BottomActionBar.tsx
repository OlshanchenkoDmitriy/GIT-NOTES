import React from 'react';
import { Button } from './ui/button';
import { Undo, Redo, Copy, Play, RotateCcw } from 'lucide-react';
import { toastHelpers } from './Toast';

interface BottomActionBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onApply: () => void;
  onReset: () => void;
  processedText: string;
  canApply: boolean;
}

export function BottomActionBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onApply,
  onReset,
  processedText,
  canApply
}: BottomActionBarProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedText);
      toastHelpers.copySuccess();
    } catch (error) {
      toastHelpers.copyError();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="safe-area-inset-bottom">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Левая группа - История */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex items-center gap-2"
              >
                <Undo className="h-4 w-4" />
                <span className="hidden sm:inline">Отменить</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex items-center gap-2"
              >
                <Redo className="h-4 w-4" />
                <span className="hidden sm:inline">Повторить</span>
              </Button>
            </div>

            {/* Центральная группа - Основные действия */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!processedText}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Копировать</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Сбросить</span>
              </Button>
            </div>

            {/* Правая группа - Основное действие */}
            <div>
              <Button
                size="sm"
                onClick={onApply}
                disabled={!canApply}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Применить</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}