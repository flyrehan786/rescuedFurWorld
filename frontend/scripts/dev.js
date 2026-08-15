/* eslint-disable */
// Runs the gallery manifest watcher and `ng serve` together.
// Used by `npm start` so new photos in src/assets/gallery show up live.
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const isWindows = process.platform === 'win32';

function spawnChild(command, args, name) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: isWindows
  });

  child.on('exit', (code, signal) => {
    console.log(`[${name}] exited with ${signal || code}`);
    shutdown(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(`[${name}] failed to start:`, err.message);
    shutdown(1);
  });

  return child;
}

const children = [];
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill();
      } catch (_) {
        /* noop */
      }
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

children.push(
  spawnChild(process.execPath, ['scripts/generate-gallery-manifest.js', '--watch'], 'gallery')
);

const ngArgs = ['ng', 'serve', ...process.argv.slice(2)];
children.push(spawnChild(isWindows ? 'npx.cmd' : 'npx', ngArgs, 'ng'));
