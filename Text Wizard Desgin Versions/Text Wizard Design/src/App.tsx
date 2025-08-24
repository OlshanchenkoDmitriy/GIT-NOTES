import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Operation, OperationType, Preset } from './types';
import { processText, createOperation, operationLabels } from './utils/textProcessing';
import { HistoryManager } from './utils/history';
import { OperationItem } from './components/OperationItem';
import { PresetManager } from './components/PresetManager';
import { TextDataPanel } from './components/TextDataPanel';
import { BottomActionBar } from './components/BottomActionBar';
import { toastHelpers } from './components/Toast';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { Plus, FileText } from 'lucide-react';

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [previewUpTo, setPreviewUpTo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // История изменений
  const historyManager = useRef(new HistoryManager(50));
  const [historyInfo, setHistoryInfo] = useState(historyManager.current.getHistoryInfo());

  // Проверка размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Загружаем пресеты из localStorage при старте
  useEffect(() => {
    const savedPresets = localStorage.getItem('textProcessingPresets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setPresets(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        })));
      } catch (error) {
        console.error('Ошибка загрузки пресетов:', error);
        toastHelpers.error('Ошибка загрузки пресетов');
      }
    }

    // Сохраняем начальное состояние в истории
    historyManager.current.pushState('', [], 'Начальное состояние');
    setHistoryInfo(historyManager.current.getHistoryInfo());
  }, []);

  // Сохраняем пресеты в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('textProcessingPresets', JSON.stringify(presets));
  }, [presets]);

  // Функция для сохранения состояния в истории
  const saveToHistory = useCallback((text: string, ops: Operation[], description: string) => {
    historyManager.current.pushState(text, ops, description);
    setHistoryInfo(historyManager.current.getHistoryInfo());
  }, []);

  // Автоматически обрабатываем текст при изменении операций или исходного текста
  const updateProcessedText = useCallback(() => {
    if (originalText) {
      let operationsToApply = operations;
      
      if (previewUpTo) {
        const previewIndex = operations.findIndex(op => op.id === previewUpTo);
        if (previewIndex !== -1) {
          operationsToApply = operations.slice(0, previewIndex + 1);
        }
      }
      
      const result = processText(originalText, operationsToApply);
      setProcessedText(result);
    } else {
      setProcessedText('');
    }
  }, [originalText, operations, previewUpTo]);

  useEffect(() => {
    updateProcessedText();
  }, [updateProcessedText]);

  // Обработчики для истории
  const handleUndo = useCallback(() => {
    const state = historyManager.current.undo();
    if (state) {
      setOriginalText(state.originalText);
      setOperations(state.operations);
      setPreviewUpTo(null);
      setHistoryInfo(historyManager.current.getHistoryInfo());
      toastHelpers.info('Действие отменено');
    }
  }, []);

  const handleRedo = useCallback(() => {
    const state = historyManager.current.redo();
    if (state) {
      setOriginalText(state.originalText);
      setOperations(state.operations);
      setPreviewUpTo(null);
      setHistoryInfo(historyManager.current.getHistoryInfo());
      toastHelpers.info('Действие повторено');
    }
  }, []);

  const addOperation = (type: OperationType) => {
    const newOperation = createOperation(type);
    const newOperations = [...operations, newOperation];
    setOperations(newOperations);
    setPreviewUpTo(null);
    saveToHistory(originalText, newOperations, `Добавлена операция: ${operationLabels[type]}`);
  };

  const updateOperation = (updatedOperation: Operation) => {
    const newOperations = operations.map(op => op.id === updatedOperation.id ? updatedOperation : op);
    setOperations(newOperations);
    setPreviewUpTo(null);
    saveToHistory(originalText, newOperations, `Изменена операция: ${operationLabels[updatedOperation.type]}`);
  };

  const removeOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    const newOperations = operations.filter(op => op.id !== operationId);
    setOperations(newOperations);
    setPreviewUpTo(null);
    if (operation) {
      saveToHistory(originalText, newOperations, `Удалена операция: ${operationLabels[operation.type]}`);
    }
  };

  const moveOperation = (operationId: string, direction: 'up' | 'down') => {
    const index = operations.findIndex(op => op.id === operationId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= operations.length) return;

    const newOperations = [...operations];
    [newOperations[index], newOperations[newIndex]] = [newOperations[newIndex], newOperations[index]];
    setOperations(newOperations);
    setPreviewUpTo(null);
    saveToHistory(originalText, newOperations, 'Изменен порядок операций');
  };

  const previewOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (operation) {
      setPreviewUpTo(previewUpTo === operationId ? null : operationId);
    }
  };

  const handleTextChange = (text: string) => {
    setOriginalText(text);
    if (text !== originalText) {
      saveToHistory(text, operations, 'Изменен исходный текст');
    }
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setOriginalText(content);
        saveToHistory(content, operations, `Загружен файл: ${file.name}`);
        toastHelpers.fileLoadSuccess(file.name);
      };
      reader.onerror = () => {
        toastHelpers.fileLoadError();
      };
      reader.readAsText(file);
    }
  };

  const handleFileButtonClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv,.json';
    input.onchange = loadFile;
    input.click();
  };

  const downloadResult = () => {
    try {
      const blob = new Blob([processedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'processed_text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toastHelpers.success('Файл скачан');
    } catch (error) {
      toastHelpers.error('Ошибка скачивания файла');
    }
  };

  const resetAll = () => {
    setOperations([]);
    setOriginalText('');
    setProcessedText('');
    setPreviewUpTo(null);
    historyManager.current.clear();
    historyManager.current.pushState('', [], 'Сброс к начальному состоянию');
    setHistoryInfo(historyManager.current.getHistoryInfo());
    toastHelpers.success('Все данные сброшены');
  };

  const applyOperations = () => {
    updateProcessedText();
    toastHelpers.success('Операции применены');
  };

  const savePreset = (name: string, operations: Operation[]) => {
    const newPreset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      operations: JSON.parse(JSON.stringify(operations)),
      createdAt: new Date()
    };
    setPresets(prev => [...prev, newPreset]);
    toastHelpers.presetSaved(name);
  };

  const loadPreset = (preset: Preset) => {
    const newOperations = JSON.parse(JSON.stringify(preset.operations));
    setOperations(newOperations);
    setPreviewUpTo(null);
    saveToHistory(originalText, newOperations, `Загружен пресет: ${preset.name}`);
    toastHelpers.presetLoaded(preset.name);
  };

  const deletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    setPresets(prev => prev.filter(p => p.id !== presetId));
    if (preset) {
      toastHelpers.success('Пресет удален', preset.name);
    }
  };

  const operationTypes: OperationType[] = [
    'removeCharacters',
    'regexReplace', 
    'changeCase',
    'deduplicate',
    'removeEmptyLines',
    'trimWhitespace',
    'addPrefixSuffix'
  ];

  const enabledOperationsCount = operations.filter(op => op.enabled).length;
  const previewInfo = previewUpTo ? 
    operationLabels[operations.find(op => op.id === previewUpTo)?.type!] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-4 lg:p-6">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="mb-2">Инструмент пакетной обработки текста</h1>
          <p className="text-muted-foreground">
            Создавайте цепочки операций для автоматизации обработки текстовых данных
          </p>
        </div>

        {isMobile ? (
          /* Мобильная версия - вертикальная компоновка */
          <div className="space-y-6">
            {/* Текстовые данные */}
            <TextDataPanel
              originalText={originalText}
              processedText={processedText}
              onOriginalTextChange={handleTextChange}
              onLoadFile={handleFileButtonClick}
              onDownload={downloadResult}
              previewInfo={previewInfo}
            />

            {/* Управление операциями */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Операции</span>
                  <Badge variant="secondary">
                    {enabledOperationsCount} из {operations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={(value) => addOperation(value as OperationType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Добавить операцию..." />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>{operationLabels[type]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Цепочка операций */}
            <Card>
              <CardHeader>
                <CardTitle>Цепочка операций</CardTitle>
              </CardHeader>
              <CardContent>
                {operations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Добавьте операции для начала обработки текста</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {operations.map((operation, index) => (
                      <div key={operation.id}>
                        <OperationItem
                          operation={operation}
                          onUpdate={updateOperation}
                          onRemove={() => removeOperation(operation.id)}
                          onPreview={() => previewOperation(operation.id)}
                          isFirst={index === 0}
                          isLast={index === operations.length - 1}
                          onMoveUp={() => moveOperation(operation.id, 'up')}
                          onMoveDown={() => moveOperation(operation.id, 'down')}
                        />
                        {index < operations.length - 1 && (
                          <div className="flex justify-center my-2">
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Пресеты */}
            <PresetManager
              operations={operations}
              presets={presets}
              onSavePreset={savePreset}
              onLoadPreset={loadPreset}
              onDeletePreset={deletePreset}
            />
          </div>
        ) : (
          /* Десктопная версия - трехколоночная компоновка */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая панель - Настройки */}
            <div className="space-y-6">
              {/* Управление операциями */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Операции</span>
                    <Badge variant="secondary">
                      {enabledOperationsCount} из {operations.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select onValueChange={(value) => addOperation(value as OperationType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Добавить операцию..." />
                    </SelectTrigger>
                    <SelectContent>
                      {operationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>{operationLabels[type]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Пресеты */}
              <PresetManager
                operations={operations}
                presets={presets}
                onSavePreset={savePreset}
                onLoadPreset={loadPreset}
                onDeletePreset={deletePreset}
              />
            </div>

            {/* Центральная панель - Цепочка операций */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Цепочка операций</CardTitle>
                </CardHeader>
                <CardContent>
                  {operations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Добавьте операции для начала обработки текста</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-4">
                        {operations.map((operation, index) => (
                          <div key={operation.id}>
                            <OperationItem
                              operation={operation}
                              onUpdate={updateOperation}
                              onRemove={() => removeOperation(operation.id)}
                              onPreview={() => previewOperation(operation.id)}
                              isFirst={index === 0}
                              isLast={index === operations.length - 1}
                              onMoveUp={() => moveOperation(operation.id, 'up')}
                              onMoveDown={() => moveOperation(operation.id, 'down')}
                            />
                            {index < operations.length - 1 && (
                              <div className="flex justify-center my-2">
                                <div className="w-px h-4 bg-border"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Правая панель - Текст */}
            <div>
              <TextDataPanel
                originalText={originalText}
                processedText={processedText}
                onOriginalTextChange={handleTextChange}
                onLoadFile={handleFileButtonClick}
                onDownload={downloadResult}
                previewInfo={previewInfo}
              />
            </div>
          </div>
        )}
      </div>

      {/* Фиксированная нижняя панель */}
      <BottomActionBar
        canUndo={historyInfo.canUndo}
        canRedo={historyInfo.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onApply={applyOperations}
        onReset={resetAll}
        processedText={processedText}
        canApply={!!originalText && operations.length > 0}
      />

      {/* Toaster для уведомлений */}
      <Toaster position="top-right" richColors />
    </div>
  );
}