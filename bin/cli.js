#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join, dirname, sep, basename } from 'path';
import { fileURLToPath } from 'url';
import { homedir, platform } from 'os';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const CLAUDE_DIR = join(homedir(), '.claude');
const MANIFEST_FILE = join(CLAUDE_DIR, '.claude-code-setup.json');
const IS_WINDOWS = platform() === 'win32';

const VERSION = '1.0.0';
const AUTHOR = {
  name: 'Matheus Kindrazki',
  github: 'https://github.com/matheuskindrazki',
  repo: 'https://github.com/matheuskindrazki/claude-code-setup',
  twitter: 'https://twitter.com/maikiemedia',
};

// Windows-compatible colors
const supportsColors = process.stdout.isTTY &&
  (process.env.FORCE_COLOR !== '0') &&
  (IS_WINDOWS ? process.env.TERM !== 'dumb' : true);

const c = supportsColors ? {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',
} : {
  reset: '', green: '', yellow: '', blue: '', cyan: '', magenta: '', red: '', dim: '', bold: '', underline: '',
};

const log = {
  info: (msg) => console.log(`  ${c.blue}info${c.reset}  ${msg}`),
  success: (msg) => console.log(`  ${c.green}done${c.reset}  ${msg}`),
  warn: (msg) => console.log(`  ${c.yellow}skip${c.reset}  ${msg}`),
  error: (msg) => console.log(`  ${c.red}fail${c.reset}  ${msg}`),
  add: (msg) => console.log(`  ${c.green} +${c.reset}    ${msg}`),
  update: (msg) => console.log(`  ${c.cyan} ~${c.reset}    ${msg}`),
  remove: (msg) => console.log(`  ${c.red} -${c.reset}    ${msg}`),
};

function banner() {
  console.log(`
  ${c.cyan}${c.bold}╔═══════════════════════════════════════════════════════════╗${c.reset}
  ${c.cyan}${c.bold}║${c.reset}                                                           ${c.cyan}${c.bold}║${c.reset}
  ${c.cyan}${c.bold}║${c.reset}   ${c.bold}Claude Code Setup${c.reset}                                      ${c.cyan}${c.bold}║${c.reset}
  ${c.cyan}${c.bold}║${c.reset}   ${c.dim}Best practices for Claude Code - agents, skills & more${c.reset}  ${c.cyan}${c.bold}║${c.reset}
  ${c.cyan}${c.bold}║${c.reset}                                                           ${c.cyan}${c.bold}║${c.reset}
  ${c.cyan}${c.bold}╚═══════════════════════════════════════════════════════════╝${c.reset}
`);
}

function displayPath(fullPath) {
  const home = homedir();
  if (fullPath.startsWith(home)) {
    const relative = fullPath.slice(home.length);
    return IS_WINDOWS ? `%USERPROFILE%${relative}` : `~${relative}`;
  }
  return fullPath;
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Manifest functions
function loadPackageManifest() {
  const manifestPath = join(TEMPLATES_DIR, 'manifest.json');
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, 'utf-8'));
}

function loadInstalledManifest() {
  if (!existsSync(MANIFEST_FILE)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function saveInstalledManifest(manifest) {
  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

function getSourcePath(fileKey) {
  if (fileKey.startsWith('templates/')) {
    return join(TEMPLATES_DIR, 'project-setup', fileKey.replace('templates/project-setup/', ''));
  }
  return join(TEMPLATES_DIR, fileKey);
}

function getDestPath(fileKey) {
  return join(CLAUDE_DIR, fileKey);
}

function isNewer(v1, v2) {
  const parse = (v) => (v || '0.0.0').split('.').map(Number);
  const [a1, b1, c1] = parse(v1);
  const [a2, b2, c2] = parse(v2);
  if (a1 !== a2) return a1 > a2;
  if (b1 !== b2) return b1 > b2;
  return c1 > c2;
}

function backupFile(filePath) {
  if (existsSync(filePath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = `${filePath}.backup-${timestamp}`;
    renameSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

function copyFile(src, dest, options = {}) {
  const { backup = false, dryRun = false } = options;
  ensureDir(dirname(dest));

  let backupPath = null;
  if (backup && existsSync(dest) && !dryRun) {
    backupPath = backupFile(dest);
  }

  if (!dryRun) {
    cpSync(src, dest);
  }
  return backupPath;
}

function showFooter() {
  console.log(`
  ${c.dim}─────────────────────────────────────────────────────────────${c.reset}

  ${c.bold}Created by ${c.cyan}${AUTHOR.name}${c.reset}

  ${c.dim}GitHub:${c.reset}  ${c.underline}${AUTHOR.repo}${c.reset}
  ${c.dim}Twitter:${c.reset} ${c.underline}${AUTHOR.twitter}${c.reset}

  ${c.yellow}★${c.reset} ${c.dim}If this helped you, consider giving it a star!${c.reset}
  ${c.dim}─────────────────────────────────────────────────────────────${c.reset}
`);
}

function showSuccessBanner(stats) {
  const { created, updated, skipped } = stats;

  console.log(`
  ${c.green}${c.bold}╔═══════════════════════════════════════════════════════════╗${c.reset}
  ${c.green}${c.bold}║${c.reset}                                                           ${c.green}${c.bold}║${c.reset}
  ${c.green}${c.bold}║${c.reset}   ${c.green}${c.bold}✓ Setup Complete!${c.reset}                                      ${c.green}${c.bold}║${c.reset}
  ${c.green}${c.bold}║${c.reset}                                                           ${c.green}${c.bold}║${c.reset}
  ${c.green}${c.bold}║${c.reset}   ${c.green}+${created} created${c.reset}  ${c.cyan}~${updated} updated${c.reset}  ${c.yellow}○${skipped} skipped${c.reset}                  ${c.green}${c.bold}║${c.reset}
  ${c.green}${c.bold}║${c.reset}                                                           ${c.green}${c.bold}║${c.reset}
  ${c.green}${c.bold}╚═══════════════════════════════════════════════════════════╝${c.reset}

  ${c.bold}Try these commands in Claude Code:${c.reset}

    ${c.cyan}Ask Claude:${c.reset} "Use project-setup-wizard to configure this project"
    ${c.cyan}Slash commands:${c.reset} /test, /lint, /verify, /pr

`);
}

function listInstalled() {
  banner();

  const installed = loadInstalledManifest();
  const pkg = loadPackageManifest();

  console.log(`  ${c.bold}Installed Components${c.reset}\n`);

  if (installed) {
    console.log(`  ${c.dim}Version:${c.reset} ${c.cyan}${installed.version}${c.reset}`);
    console.log(`  ${c.dim}Installed:${c.reset} ${new Date(installed.installedAt).toLocaleDateString()}`);
    if (pkg && isNewer(pkg.version, installed.version)) {
      console.log(`  ${c.yellow}${c.bold}Update available: v${pkg.version}${c.reset}`);
      console.log(`  ${c.dim}Run${c.reset} npx claude-code-setup update`);
    }
    console.log();
  }

  const components = [
    { name: 'Agents', path: join(CLAUDE_DIR, 'agents') },
    { name: 'Skills', path: join(CLAUDE_DIR, 'skills') },
    { name: 'Commands', path: join(CLAUDE_DIR, 'commands') },
    { name: 'Templates', path: join(CLAUDE_DIR, 'templates') },
  ];

  for (const comp of components) {
    console.log(`  ${c.bold}${comp.name}${c.reset}`);

    if (!existsSync(comp.path)) {
      console.log(`    ${c.dim}(none)${c.reset}\n`);
      continue;
    }

    const entries = readdirSync(comp.path, { withFileTypes: true });
    let found = false;

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      if (entry.isDirectory() && comp.name === 'Skills') {
        const skillFile = join(comp.path, entry.name, 'SKILL.md');
        if (existsSync(skillFile)) {
          console.log(`    ${c.green}●${c.reset} ${entry.name}`);
          found = true;
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        console.log(`    ${c.green}●${c.reset} ${entry.name.replace('.md', '')}`);
        found = true;
      } else if (entry.isDirectory()) {
        console.log(`    ${c.green}●${c.reset} ${entry.name}/`);
        found = true;
      }
    }

    if (!found) {
      console.log(`    ${c.dim}(none)${c.reset}`);
    }
    console.log();
  }

  showFooter();
}

function init(options = {}) {
  const { force = false, dryRun = false } = options;

  banner();

  const pkg = loadPackageManifest();
  if (!pkg) {
    log.error('Package manifest not found');
    process.exit(1);
  }

  const installed = loadInstalledManifest();

  console.log(`  ${c.bold}Installing Claude Code Setup${c.reset}\n`);
  console.log(`  ${c.dim}Version:${c.reset}  ${c.cyan}v${pkg.version}${c.reset}`);
  console.log(`  ${c.dim}Path:${c.reset}     ${c.cyan}${displayPath(CLAUDE_DIR)}${c.reset}`);
  if (installed) {
    console.log(`  ${c.dim}Previous:${c.reset} v${installed.version}`);
  }
  console.log();

  if (dryRun) {
    console.log(`  ${c.yellow}${c.bold}DRY RUN${c.reset} - No files will be modified\n`);
  }

  // Create base directories
  const dirs = ['agents', 'skills', 'commands', 'templates'];
  for (const dir of dirs) {
    ensureDir(join(CLAUDE_DIR, dir));
  }

  let created = 0, updated = 0, skipped = 0;
  const newManifest = {
    version: pkg.version,
    installedAt: new Date().toISOString(),
    files: {}
  };

  console.log(`  ${c.bold}Files${c.reset}\n`);

  for (const [fileKey, fileMeta] of Object.entries(pkg.files)) {
    const srcPath = getSourcePath(fileKey);
    const destPath = getDestPath(fileKey);
    const displayDest = displayPath(destPath);

    if (!existsSync(srcPath)) {
      continue;
    }

    const destExists = existsSync(destPath);
    const installedVersion = installed?.files?.[fileKey]?.version;
    const needsUpdate = !installedVersion || isNewer(fileMeta.version, installedVersion);

    if (!destExists) {
      copyFile(srcPath, destPath, { dryRun });
      log.add(`${displayDest}`);
      created++;
    } else if (force || needsUpdate) {
      copyFile(srcPath, destPath, { backup: true, dryRun });
      log.update(`${displayDest}`);
      updated++;
    } else {
      log.warn(`${displayDest} ${c.dim}(up to date)${c.reset}`);
      skipped++;
    }

    newManifest.files[fileKey] = {
      version: fileMeta.version,
      installedAt: new Date().toISOString()
    };
  }

  if (!dryRun) {
    saveInstalledManifest(newManifest);
  }

  console.log();
  showSuccessBanner({ created, updated, skipped });

  if (skipped > 0 && !force) {
    console.log(`  ${c.dim}Tip: Use${c.reset} --force ${c.dim}to overwrite existing files${c.reset}\n`);
  }

  showFooter();
}

function update(options = {}) {
  const { dryRun = false } = options;

  banner();

  const pkg = loadPackageManifest();
  if (!pkg) {
    log.error('Package manifest not found');
    process.exit(1);
  }

  const installed = loadInstalledManifest();

  if (!installed) {
    console.log(`  ${c.yellow}No installation found. Running init...${c.reset}\n`);
    return init(options);
  }

  console.log(`  ${c.bold}Updating Claude Code Setup${c.reset}\n`);
  console.log(`  ${c.dim}Current:${c.reset} v${installed.version}`);
  console.log(`  ${c.dim}Latest:${c.reset}  v${pkg.version}`);
  console.log();

  if (!isNewer(pkg.version, installed.version)) {
    console.log(`  ${c.green}${c.bold}✓ Already up to date!${c.reset}\n`);
    showFooter();
    return;
  }

  if (dryRun) {
    console.log(`  ${c.yellow}${c.bold}DRY RUN${c.reset} - No files will be modified\n`);
  }

  // Show changelog
  const relevantChanges = pkg.changelog?.filter(ch => isNewer(ch.version, installed.version)) || [];
  if (relevantChanges.length > 0) {
    console.log(`  ${c.bold}What's New${c.reset}\n`);
    for (const change of relevantChanges) {
      console.log(`  ${c.cyan}v${change.version}${c.reset} ${c.dim}(${change.date})${c.reset}`);
      if (change.changes.added?.length) {
        change.changes.added.forEach(a => console.log(`    ${c.green}+${c.reset} ${a}`));
      }
      if (change.changes.changed?.length) {
        change.changes.changed.forEach(ch => console.log(`    ${c.cyan}~${c.reset} ${ch}`));
      }
      if (change.changes.removed?.length) {
        change.changes.removed.forEach(r => console.log(`    ${c.red}-${c.reset} ${r}`));
      }
    }
    console.log();
  }

  // Calculate changes
  const installedFiles = new Set(Object.keys(installed.files || {}));
  const packageFiles = new Set(Object.keys(pkg.files));

  const toAdd = [...packageFiles].filter(f => !installedFiles.has(f));
  const toRemove = [...installedFiles].filter(f => !packageFiles.has(f));
  const toUpdate = [...packageFiles].filter(f => {
    if (!installedFiles.has(f)) return false;
    return isNewer(pkg.files[f]?.version, installed.files[f]?.version);
  });

  console.log(`  ${c.bold}Files${c.reset}\n`);

  let added = 0, updated = 0, removed = 0;
  const newManifest = {
    version: pkg.version,
    installedAt: new Date().toISOString(),
    updatedFrom: installed.version,
    files: {}
  };

  // Add new files
  for (const fileKey of toAdd) {
    const srcPath = getSourcePath(fileKey);
    const destPath = getDestPath(fileKey);
    if (!existsSync(srcPath)) continue;

    copyFile(srcPath, destPath, { dryRun });
    log.add(`${displayPath(destPath)}`);
    added++;
    newManifest.files[fileKey] = { version: pkg.files[fileKey].version, installedAt: new Date().toISOString() };
  }

  // Update changed files
  for (const fileKey of toUpdate) {
    const srcPath = getSourcePath(fileKey);
    const destPath = getDestPath(fileKey);
    if (!existsSync(srcPath)) continue;

    const backupPath = copyFile(srcPath, destPath, { backup: true, dryRun });
    log.update(`${displayPath(destPath)}`);
    if (backupPath) {
      console.log(`         ${c.dim}backup: ${displayPath(backupPath)}${c.reset}`);
    }
    updated++;
    newManifest.files[fileKey] = {
      version: pkg.files[fileKey].version,
      installedAt: new Date().toISOString(),
      updatedFrom: installed.files[fileKey]?.version
    };
  }

  // Keep unchanged files
  for (const fileKey of packageFiles) {
    if (!toAdd.includes(fileKey) && !toUpdate.includes(fileKey)) {
      newManifest.files[fileKey] = installed.files[fileKey];
    }
  }

  // Note deprecated files
  for (const fileKey of toRemove) {
    log.remove(`${fileKey} ${c.dim}(deprecated - delete manually if not needed)${c.reset}`);
    removed++;
  }

  if (!dryRun) {
    saveInstalledManifest(newManifest);
  }

  console.log();
  showSuccessBanner({ created: added, updated, skipped: 0 });

  if (removed > 0) {
    console.log(`  ${c.yellow}Note:${c.reset} ${removed} file(s) deprecated. Delete manually if not needed.\n`);
  }

  showFooter();
}

function showChangelog() {
  banner();

  const pkg = loadPackageManifest();
  if (!pkg?.changelog) {
    log.error('Changelog not found');
    return;
  }

  const installed = loadInstalledManifest();

  console.log(`  ${c.bold}Changelog${c.reset}\n`);

  for (const change of pkg.changelog) {
    const isCurrent = installed?.version === change.version;
    const marker = isCurrent ? ` ${c.green}● installed${c.reset}` : '';

    console.log(`  ${c.cyan}${c.bold}v${change.version}${c.reset}${marker} ${c.dim}(${change.date})${c.reset}`);

    if (change.changes.added?.length) {
      change.changes.added.forEach(a => console.log(`    ${c.green}+${c.reset} ${a}`));
    }
    if (change.changes.changed?.length) {
      change.changes.changed.forEach(ch => console.log(`    ${c.cyan}~${c.reset} ${ch}`));
    }
    if (change.changes.removed?.length) {
      change.changes.removed.forEach(r => console.log(`    ${c.red}-${c.reset} ${r}`));
    }
    if (change.changes.deprecated?.length) {
      change.changes.deprecated.forEach(d => console.log(`    ${c.yellow}!${c.reset} ${d}`));
    }
    console.log();
  }

  showFooter();
}

function showHelp() {
  banner();

  console.log(`  ${c.bold}Usage${c.reset}

    npx claude-code-setup ${c.cyan}<command>${c.reset} [options]

  ${c.bold}Commands${c.reset}

    ${c.cyan}init${c.reset}        Install all components (first time)
    ${c.cyan}update${c.reset}      Update to latest version
    ${c.cyan}list${c.reset}        Show installed components
    ${c.cyan}changelog${c.reset}   Show version history
    ${c.cyan}help${c.reset}        Show this message

  ${c.bold}Options${c.reset}

    ${c.yellow}--force, -f${c.reset}   Overwrite all files
    ${c.yellow}--dry-run${c.reset}     Preview changes without applying

  ${c.bold}Examples${c.reset}

    ${c.dim}# First time setup${c.reset}
    npx claude-code-setup init

    ${c.dim}# Update to latest${c.reset}
    npx claude-code-setup update

    ${c.dim}# Force reinstall everything${c.reset}
    npx claude-code-setup init --force

  ${c.bold}What gets installed${c.reset}

    ${c.cyan}~/.claude/${c.reset}
    ├── ${c.green}agents/${c.reset}
    │   └── project-setup-wizard.md
    ├── ${c.green}skills/${c.reset}
    │   ├── project-analysis/
    │   └── claude-code-templates/
    ├── ${c.green}commands/${c.reset}
    │   └── test, lint, verify, pr, setup
    └── ${c.green}templates/${c.reset}
        └── project-setup/

`);
  showFooter();
}

// Check Node.js version
const nodeVersion = process.versions.node.split('.').map(Number);
if (nodeVersion[0] < 16 || (nodeVersion[0] === 16 && nodeVersion[1] < 7)) {
  console.error(`\n  ${c.red}Error:${c.reset} Node.js 16.7+ required (you have ${process.versions.node})\n`);
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args.find(a => !a.startsWith('-')) || 'help';
const flags = {
  force: args.includes('--force') || args.includes('-f'),
  dryRun: args.includes('--dry-run'),
};

switch (command) {
  case 'init':
  case 'install':
    init({ force: flags.force, dryRun: flags.dryRun });
    break;
  case 'update':
  case 'upgrade':
    update({ dryRun: flags.dryRun });
    break;
  case 'list':
  case 'ls':
    listInstalled();
    break;
  case 'changelog':
  case 'changes':
    showChangelog();
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}
