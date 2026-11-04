const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Never rebuild the shared .next directory while a dev server is running.
// Next's production build can replace dev manifests and crash the open browser.
const devLockFile = path.join(__dirname, '..', '.next', 'dev', 'lock');
if (fs.existsSync(devLockFile)) {
  console.error('A Next.js dev server is running. Stop it before running the production build.');
  process.exit(1);
}

// 1. Clean stale dev lock if present
try {
  const lockFile = devLockFile;
  if (fs.existsSync(lockFile)) {
    try {
      fs.unlinkSync(lockFile);
    } catch {}
  }
  const devDir = path.join(__dirname, '..', '.next', 'dev');
  if (fs.existsSync(devDir)) {
    try {
      fs.rmSync(devDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
    } catch {}
  }
} catch {}

// 2. Set NODE_OPTIONS with patch-fs to handle Windows OneDrive transient EPERM locks on mkdir
const patchPath = path.resolve(__dirname, 'patch-fs.js').replace(/\\/g, '/');
const existingOptions = process.env.NODE_OPTIONS || '';
if (!existingOptions.includes('patch-fs.js')) {
  process.env.NODE_OPTIONS = `${existingOptions} --require "${patchPath}"`.trim();
}

// 3. Resolve next binary
const nextBin = path.resolve(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

try {
  execSync(`node "${nextBin}" build --webpack`, {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  process.exit(error.status || 1);
}
