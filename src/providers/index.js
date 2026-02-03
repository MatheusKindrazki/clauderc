/**
 * Provider registry for multi-provider support
 */

import { claudeProvider } from './claude.js';
import { cursorProvider } from './cursor.js';

export const PROVIDERS = {
  claude: claudeProvider,
  cursor: cursorProvider,
};

export function getProvider(id) {
  return PROVIDERS[id] || null;
}

export function getProviderChoices() {
  return [
    { id: 'claude', label: 'Claude Code', description: 'CLAUDE.md + .claude/' },
    { id: 'cursor', label: 'Cursor', description: '.cursorrules + .cursor/rules/' },
    { id: 'both', label: 'Both', description: 'Configure both tools' },
  ];
}

const VALID_CHOICES = new Set(['claude', 'cursor', 'both']);

export function resolveProviders(choice) {
  if (!VALID_CHOICES.has(choice)) {
    throw new Error(`Invalid provider: "${choice}". Valid options: claude, cursor, both`);
  }
  if (choice === 'both') {
    return [PROVIDERS.claude, PROVIDERS.cursor];
  }
  return [PROVIDERS[choice]];
}
