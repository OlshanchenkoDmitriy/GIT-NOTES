import React, { useState, useEffect, useCallback } from 'react';
import { Operation, OperationType, Preset } from './types';
import { processText, createOperation, operationLabels } from './utils/textProcessing';
import { OperationItem } from './components/OperationItem';
import { PresetManager } from './components/PresetManager';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { Plus, FileText, Download, RotateCcw, Play, Menu } from 'lucide-react';

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [previewUpTo, setPreviewUpTo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      }
    }
  }, []);

  // Сохраняем пресеты в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('textProcessingPresets', JSON.stringify(presets));
  }, [presets]);

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

  const addOperation = (type: OperationType) => {
    const newOperation = createOperation(type);
    setOperations(prev => [...prev, newOperation]);
    setPreviewUpTo(null);
  };

  const updateOperation = (updatedOperation: Operation) => {
    setOperations(prev => 
      prev.map(op => op.id === updatedOperation.id ? updatedOperation : op)
    );
    setPreviewUpTo(null);
  };

  const removeOperation = (operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
    setPreviewUpTo(null);
  };

  const moveOperation = (operationId: string, direction: 'up' | 'down') => {
    setOperations(prev => {
      const index = prev.findIndex(op => op.id === operationId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newOperations = [...prev];
      [newOperations[index], newOperations[newIndex]] = [newOperations[newIndex], newOperations[index]];
      return newOperations;
    });
    setPreviewUpTo(null);
  };

  const previewOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (operation) {
      setPreviewUpTo(previewUpTo === operationId ? null : operationId);
    }
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setOriginalText(content);
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
    const blob = new Blob([processedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setOperations([]);
    setOriginalText('');
    setProcessedText('');
    setPreviewUpTo(null);
  };

  const savePreset = (name: string, operations: Operation[]) => {
    const newPreset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      operations: JSON.parse(JSON.stringify(operations)), // глубокое копирование
      createdAt: new Date()
    };
    setPresets(prev => [...prev, newPreset]);
  };

  const loadPreset = (preset: Preset) => {
    setOperations(JSON.parse(JSON.stringify(preset.operations))); // глубокое копирование
    setPreviewUpTo(null);
  };

  const deletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
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
  const originalLinesCount = originalText.split('\n').length;
  const processedLinesCount = processedText.split('\n').length;

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
            <Card>
              <CardHeader>
                <CardTitle>Текстовые данные</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="input" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="input">Исходный текст</TabsTrigger>
                    <TabsTrigger value="output">Результат</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="input" className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleFileButtonClick}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Загрузить файл
                    </Button>
                    
                    <Textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      placeholder="Вставьте или загрузите текст для обработки..."
                      className="h-[300px] resize-none font-mono text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="output" className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="text-sm text-muted-foreground flex-1">
                        {previewUpTo && (
                          <span>Предварительный просмотр до: {operationLabels[operations.find(op => op.id === previewUpTo)?.type!]}</span>
                        )}
                      </div>
                      <Button
                        onClick={downloadResult}
                        disabled={!processedText}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                    
                    <Textarea
                      value={processedText}
                      readOnly
                      className="h-[300px] resize-none font-mono text-sm bg-muted/30"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

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

                <div className="flex space-x-2">
                  <Button onClick={resetAll} variant="outline" size="sm" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Сбросить
                  </Button>
                  <Button 
                    onClick={updateProcessedText} 
                    size="sm"
                    disabled={!originalText || operations.length === 0}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Применить
                  </Button>
                </div>
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

            {/* Пресеты и статистика */}
            <div className="space-y-6">
              <PresetManager
                operations={operations}
                presets={presets}
                onSavePreset={savePreset}
                onLoadPreset={loadPreset}
                onDeletePreset={deletePreset}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Исходные строки:</span>
                    <Badge variant="outline">{originalLinesCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Обработанные строки:</span>
                    <Badge variant="outline">{processedLinesCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Изменение:</span>
                    <Badge variant={processedLinesCount > originalLinesCount ? "default" : processedLinesCount < originalLinesCount ? "destructive" : "secondary"}>
                      {processedLinesCount > originalLinesCount ? '+' : ''}{processedLinesCount - originalLinesCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => addOperation(value as OperationType)}>
                      <SelectTrigger className="flex-1">
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
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={resetAll} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Сбросить
                    </Button>
                    <Button 
                      onClick={updateProcessedText} 
                      size="sm"
                      disabled={!originalText || operations.length === 0}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Применить
                    </Button>
                  </div>
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

              {/* Статистика */}
              <Card>
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Исходные строки:</span>
                    <Badge variant="outline">{originalLinesCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Обработанные строки:</span>
                    <Badge variant="outline">{processedLinesCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Изменение:</span>
                    <Badge variant={processedLinesCount > originalLinesCount ? "default" : processedLinesCount < originalLinesCount ? "destructive" : "secondary"}>
                      {processedLinesCount > originalLinesCount ? '+' : ''}{processedLinesCount - originalLinesCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
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
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Текстовые данные</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="input" className="h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="input">Исходный текст</TabsTrigger>
                      <TabsTrigger value="output">Результат</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="input" className="space-y-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleFileButtonClick}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Загрузить файл
                        </Button>
                      </div>
                      
                      <Textarea
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                        placeholder="Вставьте или загрузите текст для обработки..."
                        className="h-[500px] resize-none font-mono text-sm"
                      />
                    </TabsContent>
                    
                    <TabsContent value="output" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {previewUpTo && (
                            <span>Предварительный просмотр до: {operationLabels[operations.find(op => op.id === previewUpTo)?.type!]}</span>
                          )}
                        </div>
                        <Button
                          onClick={downloadResult}
                          disabled={!processedText}
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Скачать
                        </Button>
                      </div>
                      
                      <Textarea
                        value={processedText}
                        readOnly
                        className="h-[500px] resize-none font-mono text-sm bg-muted/30"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}