const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  serverProcess = spawn('npm.cmd', ['run', 'dev'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit'
  });

  setTimeout(() => {
    createWindow();
  }, 4000);
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});