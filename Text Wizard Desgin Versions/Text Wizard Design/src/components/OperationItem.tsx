import React from 'react';
import { Operation, OperationType, CaseType } from '../types';
import { operationLabels } from '../utils/textProcessing';
import { Card, CardContent, CardHeader } from './ui/card';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { GripVertical, X, Eye } from 'lucide-react';

interface OperationItemProps {
  operation: Operation;
  onUpdate: (operation: Operation) => void;
  onRemove: () => void;
  onPreview: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function OperationItem({
  operation,
  onUpdate,
  onRemove,
  onPreview,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown
}: OperationItemProps) {
  const updateSettings = (key: string, value: any) => {
    onUpdate({
      ...operation,
      settings: {
        ...operation.settings,
        [key]: value
      }
    });
  };

  const toggleEnabled = () => {
    onUpdate({
      ...operation,
      enabled: !operation.enabled
    });
  };

  const renderSettings = () => {
    switch (operation.type) {
      case 'removeCharacters':
        return (
          <div className="space-y-2">
            <Label>Символы для удаления</Label>
            <Input
              value={operation.settings.characters || ''}
              onChange={(e) => updateSettings('characters', e.target.value)}
              placeholder="Введите символы, например: .,!?"
            />
          </div>
        );

      case 'regexReplace':
        return (
          <div className="space-y-2">
            <div>
              <Label>Регулярное выражение</Label>
              <Input
                value={operation.settings.pattern || ''}
                onChange={(e) => updateSettings('pattern', e.target.value)}
                placeholder="Например: \d+"
              />
            </div>
            <div>
              <Label>Замена</Label>
              <Input
                value={operation.settings.replacement || ''}
                onChange={(e) => updateSettings('replacement', e.target.value)}
                placeholder="Текст для замены"
              />
            </div>
            <div>
              <Label>Флаги</Label>
              <Input
                value={operation.settings.flags || 'g'}
                onChange={(e) => updateSettings('flags', e.target.value)}
                placeholder="g, i, m"
              />
            </div>
          </div>
        );

      case 'changeCase':
        return (
          <div className="space-y-2">
            <Label>Тип регистра</Label>
            <Select
              value={operation.settings.caseType || 'lowercase'}
              onValueChange={(value) => updateSettings('caseType', value as CaseType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uppercase">ВЕРХНИЙ РЕГИСТР</SelectItem>
                <SelectItem value="lowercase">нижний регистр</SelectItem>
                <SelectItem value="capitalize">Каждое Слово С Заглавной</SelectItem>
                <SelectItem value="sentence">Как предложение</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'deduplicate':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`preserve-order-${operation.id}`}
                checked={operation.settings.preserveOrder || false}
                onCheckedChange={(checked) => updateSettings('preserveOrder', checked)}
              />
              <Label htmlFor={`preserve-order-${operation.id}`}>
                Сохранить порядок строк
              </Label>
            </div>
          </div>
        );

      case 'addPrefixSuffix':
        return (
          <div className="space-y-2">
            <div>
              <Label>Префикс</Label>
              <Input
                value={operation.settings.prefix || ''}
                onChange={(e) => updateSettings('prefix', e.target.value)}
                placeholder="Текст в начале строки"
              />
            </div>
            <div>
              <Label>Суффикс</Label>
              <Input
                value={operation.settings.suffix || ''}
                onChange={(e) => updateSettings('suffix', e.target.value)}
                placeholder="Текст в конце строки"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`transition-opacity ${!operation.enabled ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={isFirst}
                className="h-4 w-4 p-0"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={isLast}
                className="h-4 w-4 p-0"
              >
                ↓
              </Button>
            </div>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{operationLabels[operation.type]}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              title="Предварительный просмотр"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Switch checked={operation.enabled} onCheckedChange={toggleEnabled} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {operation.enabled && (
        <CardContent className="pt-0">
          {renderSettings()}
        </CardContent>
      )}
    </Card>
  );
}