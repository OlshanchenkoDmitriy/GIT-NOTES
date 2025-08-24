import React, { useState } from 'react';
import { Preset, Operation } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Save, Upload, Trash2 } from 'lucide-react';

interface PresetManagerProps {
  operations: Operation[];
  presets: Preset[];
  onSavePreset: (name: string, operations: Operation[]) => void;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
}

export function PresetManager({
  operations,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset
}: PresetManagerProps) {
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSavePreset = () => {
    if (presetName.trim() && operations.length > 0) {
      onSavePreset(presetName.trim(), operations);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadPreset = () => {
    const preset = presets.find(p => p.id === selectedPresetId);
    if (preset) {
      onLoadPreset(preset);
      setSelectedPresetId('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пресеты</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={operations.length === 0}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Сохранить пресет</DialogTitle>
                <DialogDescription>
                  Введите название для сохранения текущей цепочки операций как пресет.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Название пресета"
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {presets.length > 0 && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Выберите пресет" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} ({preset.operations.length} операций)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleLoadPreset}
                disabled={!selectedPresetId}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Загрузить</span>
              </Button>
            </div>
            
            {selectedPresetId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeletePreset(selectedPresetId)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Удалить пресет</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}