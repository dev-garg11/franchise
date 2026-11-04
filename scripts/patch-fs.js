const fs = require('fs');

const origPromisesMkdir = fs.promises.mkdir;
fs.promises.mkdir = async function(dirPath, options) {
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      return await origPromisesMkdir.call(this, dirPath, options);
    } catch (err) {
      if ((err.code === 'EPERM' || err.code === 'EACCES') && fs.existsSync(dirPath)) {
        return dirPath;
      }
      if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') {
        if (attempt < 14) {
          await new Promise((r) => setTimeout(r, 60 * (attempt + 1)));
          if (fs.existsSync(dirPath)) return dirPath;
          continue;
        }
      }
      throw err;
    }
  }
};

const origMkdir = fs.mkdir;
fs.mkdir = function(dirPath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let attempt = 0;
  function tryMkdir() {
    origMkdir.call(fs, dirPath, options, (err, res) => {
      if (err) {
        if ((err.code === 'EPERM' || err.code === 'EACCES') && fs.existsSync(dirPath)) {
          return callback ? callback(null, dirPath) : undefined;
        }
        if ((err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') && attempt < 14) {
          attempt++;
          return setTimeout(() => {
            if (fs.existsSync(dirPath)) return callback ? callback(null, dirPath) : undefined;
            tryMkdir();
          }, 60 * attempt);
        }
        return callback ? callback(err) : undefined;
      }
      return callback ? callback(null, res) : undefined;
    });
  }
  tryMkdir();
};

const origMkdirSync = fs.mkdirSync;
fs.mkdirSync = function(dirPath, options) {
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      return origMkdirSync.call(this, dirPath, options);
    } catch (err) {
      if ((err.code === 'EPERM' || err.code === 'EACCES') && fs.existsSync(dirPath)) {
        return dirPath;
      }
      if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY') {
        if (attempt < 14) {
          try {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60 * (attempt + 1));
          } catch {
            const start = Date.now();
            while (Date.now() - start < 60 * (attempt + 1)) {}
          }
          if (fs.existsSync(dirPath)) return dirPath;
          continue;
        }
      }
      throw err;
    }
  }
};

