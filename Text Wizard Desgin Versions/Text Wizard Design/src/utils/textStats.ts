import { TextStats } from '../types';

export function calculateTextStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      charactersWithoutSpaces: 0,
      lines: 0,
      words: 0
    };
  }

  const lines = text.split('\n');
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;

  return {
    characters,
    charactersWithoutSpaces,
    lines: lines.length,
    words
  };
}

export function formatStats(stats: TextStats): string {
  return `${stats.characters} символов, ${stats.words} слов, ${stats.lines} строк`;
}

export function compareStats(before: TextStats, after: TextStats): {
  characters: number;
  words: number;
  lines: number;
} {
  return {
    characters: after.characters - before.characters,
    words: after.words - before.words,
    lines: after.lines - before.lines
  };
}