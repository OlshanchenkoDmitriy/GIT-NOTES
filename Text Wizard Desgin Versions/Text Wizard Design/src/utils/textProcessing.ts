import { Operation, OperationType, CaseType } from '../types';

export function processText(text: string, operations: Operation[]): string {
  const lines = text.split('\n');
  
  return operations
    .filter(op => op.enabled)
    .reduce((currentLines, operation) => {
      return applyOperation(currentLines, operation);
    }, lines)
    .join('\n');
}

function applyOperation(lines: string[], operation: Operation): string[] {
  switch (operation.type) {
    case 'removeCharacters':
      return removeCharacters(lines, operation.settings.characters || '');
    
    case 'regexReplace':
      return regexReplace(lines, operation.settings.pattern || '', operation.settings.replacement || '', operation.settings.flags || 'g');
    
    case 'changeCase':
      return changeCase(lines, operation.settings.caseType || 'lowercase');
    
    case 'deduplicate':
      return deduplicate(lines, operation.settings.preserveOrder || true);
    
    case 'removeEmptyLines':
      return removeEmptyLines(lines);
    
    case 'trimWhitespace':
      return trimWhitespace(lines);
    
    case 'addPrefixSuffix':
      return addPrefixSuffix(lines, operation.settings.prefix || '', operation.settings.suffix || '');
    
    default:
      return lines;
  }
}

function removeCharacters(lines: string[], characters: string): string[] {
  const regex = new RegExp(`[${escapeRegExp(characters)}]`, 'g');
  return lines.map(line => line.replace(regex, ''));
}

function regexReplace(lines: string[], pattern: string, replacement: string, flags: string): string[] {
  try {
    const regex = new RegExp(pattern, flags);
    return lines.map(line => line.replace(regex, replacement));
  } catch (error) {
    console.error('Invalid regex pattern:', error);
    return lines;
  }
}

function changeCase(lines: string[], caseType: CaseType): string[] {
  return lines.map(line => {
    switch (caseType) {
      case 'uppercase':
        return line.toUpperCase();
      case 'lowercase':
        return line.toLowerCase();
      case 'capitalize':
        return line.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      case 'sentence':
        return line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
      default:
        return line;
    }
  });
}

function deduplicate(lines: string[], preserveOrder: boolean): string[] {
  if (preserveOrder) {
    const seen = new Set<string>();
    return lines.filter(line => {
      if (seen.has(line)) {
        return false;
      }
      seen.add(line);
      return true;
    });
  } else {
    return Array.from(new Set(lines)).sort();
  }
}

function removeEmptyLines(lines: string[]): string[] {
  return lines.filter(line => line.trim() !== '');
}

function trimWhitespace(lines: string[]): string[] {
  return lines.map(line => line.trim());
}

function addPrefixSuffix(lines: string[], prefix: string, suffix: string): string[] {
  return lines.map(line => `${prefix}${line}${suffix}`);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createOperation(type: OperationType): Operation {
  const id = Math.random().toString(36).substr(2, 9);
  
  const defaultSettings: Record<OperationType, Record<string, any>> = {
    removeCharacters: { characters: '' },
    regexReplace: { pattern: '', replacement: '', flags: 'g' },
    changeCase: { caseType: 'lowercase' },
    deduplicate: { preserveOrder: true },
    removeEmptyLines: {},
    trimWhitespace: {},
    addPrefixSuffix: { prefix: '', suffix: '' }
  };

  return {
    id,
    type,
    enabled: true,
    settings: defaultSettings[type]
  };
}

export const operationLabels: Record<OperationType, string> = {
  removeCharacters: 'Удалить символы',
  regexReplace: 'Регулярные выражения',
  changeCase: 'Изменить регистр',
  deduplicate: 'Удалить дубликаты',
  removeEmptyLines: 'Удалить пустые строки',
  trimWhitespace: 'Обрезать пробелы',
  addPrefixSuffix: 'Добавить префикс/суффикс'
};