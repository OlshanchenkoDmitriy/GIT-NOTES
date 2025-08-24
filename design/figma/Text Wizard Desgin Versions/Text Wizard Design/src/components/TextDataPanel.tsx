import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Download, Copy, Trash2, RefreshCw, ArrowLeftRight, Clipboard } from 'lucide-react';
import { calculateTextStats, formatStats } from '../utils/textStats';
import { toastHelpers } from './Toast';

interface TextDataPanelProps {
  originalText: string;
  processedText: string;
  onOriginalTextChange: (text: string) => void;
  onLoadFile: () => void;
  onDownload: () => void;
  previewInfo?: string;
}

export function TextDataPanel({
  originalText,
  processedText,
  onOriginalTextChange,
  onLoadFile,
  onDownload,
  previewInfo
}: TextDataPanelProps) {
  const originalStats = calculateTextStats(originalText);
  const processedStats = calculateTextStats(processedText);

  const handleCopyInput = async () => {
    try {
      await navigator.clipboard.writeText(originalText);
      toastHelpers.copySuccess();
    } catch (error) {
      toastHelpers.copyError();
    }
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(processedText);
      toastHelpers.copySuccess();
    } catch (error) {
      toastHelpers.copyError();
    }
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onOriginalTextChange(text);
      toastHelpers.success('Текст вставлен');
    } catch (error) {
      toastHelpers.error('Ошибка вставки', 'Не удалось прочитать буфер обмена');
    }
  };

  const handleClearInput = () => {
    onOriginalTextChange('');
    toastHelpers.success('Текст очищен');
  };

  const handleSwapTexts = () => {
    onOriginalTextChange(processedText);
    toastHelpers.success('Тексты поменяны местами');
  };

  return (
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
            {/* Статистика исходного текста */}
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>{formatStats(originalStats)}</span>
              <div className="flex gap-1">
                <Badge variant="outline">{originalStats.characters}</Badge>
                <Badge variant="outline">{originalStats.lines} строк</Badge>
              </div>
            </div>

            {/* Кнопки управления исходным текстом */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLoadFile}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Файл
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePasteInput}
                className="flex items-center gap-2"
              >
                <Clipboard className="h-4 w-4" />
                Вставить
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyInput}
                disabled={!originalText}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Копировать
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearInput}
                disabled={!originalText}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Очистить
              </Button>
              {processedText && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSwapTexts}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Поменять
                </Button>
              )}
            </div>
            
            <Textarea
              value={originalText}
              onChange={(e) => onOriginalTextChange(e.target.value)}
              placeholder="Вставьте или загрузите текст для обработки..."
              className="h-[400px] lg:h-[500px] resize-none font-mono text-sm"
            />
          </TabsContent>
          
          <TabsContent value="output" className="space-y-4">
            {/* Статистика обработанного текста */}
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>{formatStats(processedStats)}</span>
              <div className="flex gap-1">
                <Badge variant="outline">{processedStats.characters}</Badge>
                <Badge variant="outline">{processedStats.lines} строк</Badge>
                <Badge 
                  variant={processedStats.lines > originalStats.lines ? "default" : 
                           processedStats.lines < originalStats.lines ? "destructive" : "secondary"}
                >
                  {processedStats.lines > originalStats.lines ? '+' : ''}
                  {processedStats.lines - originalStats.lines}
                </Badge>
              </div>
            </div>

            {/* Информация о предварительном просмотре */}
            {previewInfo && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <span className="font-medium">Предварительный просмотр:</span> {previewInfo}
              </div>
            )}

            {/* Кнопки управления результатом */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyOutput}
                disabled={!processedText}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Копировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={!processedText}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Скачать
              </Button>
            </div>
            
            <Textarea
              value={processedText}
              readOnly
              className="h-[400px] lg:h-[500px] resize-none font-mono text-sm bg-muted/30"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}