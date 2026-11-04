const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Remove stale Next.js dev lock if present
  const lockFile = path.join(__dirname, '..', '.next', 'dev', 'lock');
  if (fs.existsSync(lockFile)) {
    try {
      fs.unlinkSync(lockFile);
    } catch {}
  }

  if (process.platform === 'win32') {
    // 2. Kill any process holding port 3000 (regardless of TCP state: LISTENING, CLOSED, TIME_WAIT, etc.)
    try {
      const netstat = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      const pids = new Set();
      for (const line of netstat.split('\n')) {
        if (line.includes(':3000')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } catch {}
      }
    } catch {}

    // 3. Kill any lingering Next.js router-server or child dev processes for this project
    try {
      const psCommand = `Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like '*franchise-roots*next*router-server*' -or $_.CommandLine -like '*franchise-roots*next*build*') -and $_.ProcessId -ne ${process.pid} } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
      execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'ignore' });
    } catch {}
  }

  // Turbopack can leave a corrupted persistent task cache after a panic or build.
  // Clear it only after stale dev processes were handled, so a live server
  // never loses its manifest while it is serving requests.
  const devCacheDir = path.join(__dirname, '..', '.next', 'dev');
  if (fs.existsSync(devCacheDir)) {
    try {
      fs.rmSync(devCacheDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {
      try {
        if (process.platform === 'win32') {
          execSync(`powershell -NoProfile -Command "Remove-Item -Recurse -Force '${devCacheDir}' -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
        }
      } catch {}
    }
  }
} catch {}
