const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const net = require('net');

let mainWindow = null;
let backendProcess = null;
const BACKEND_PORT = 8888;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

function waitForBackend(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error('Backend startup timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error('Backend startup timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.connect(port, '127.0.0.1');
    };
    check();
  });
}

function startBackend() {
  const backendDir = path.join(__dirname, 'backend');
  const serverPath = path.join(backendDir, 'src', 'server.js');

  // Set environment variables for backend
  const env = {
    ...process.env,
    PORT: String(BACKEND_PORT),
    NODE_ENV: 'production',
    DATABASE: process.env.DATABASE || 'mongodb://localhost:27017/carpentry-workshop',
    JWT_SECRET: process.env.JWT_SECRET || 'carpentry-workshop-secret-key-2024',
    OPENSSL_CONF: '/dev/null',
    PUBLIC_SERVER_FILE: `http://localhost:${BACKEND_PORT}/`,
  };

  backendProcess = fork(serverPath, [], {
    cwd: backendDir,
    env,
    silent: true,
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
    dialog.showErrorBox(
      'Startup Error',
      'Failed to start the backend server. Please ensure MongoDB is running.\n\n' + err.message
    );
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null && mainWindow) {
      dialog.showErrorBox(
        'Backend Error',
        'The backend server stopped unexpectedly. Please check that MongoDB is running and restart the application.'
      );
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Carpentry Workshop ERP',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
    },
    show: false,
  });

  // Load the frontend
  const frontendPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  mainWindow.loadFile(frontendPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove default menu for cleaner look
  mainWindow.setMenuBarVisibility(false);
}

async function init() {
  try {
    // Check if port is available
    const portFree = await isPortAvailable(BACKEND_PORT);
    if (!portFree) {
      const result = dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Port In Use',
        message: `Port ${BACKEND_PORT} is already in use. Another instance may be running.`,
        buttons: ['Continue Anyway', 'Quit'],
      });
      if (result === 1) {
        app.quit();
        return;
      }
    } else {
      // Start backend server
      startBackend();

      // Wait for backend to be ready
      try {
        await waitForBackend(BACKEND_PORT);
        console.log('Backend is ready');
      } catch (err) {
        dialog.showErrorBox(
          'Startup Error',
          'Could not connect to the backend server.\nPlease ensure MongoDB is installed and running.\n\nInstall MongoDB: https://www.mongodb.com/try/download/community'
        );
        app.quit();
        return;
      }
    }

    createWindow();
  } catch (err) {
    console.error('Initialization error:', err);
    dialog.showErrorBox('Error', err.message);
    app.quit();
  }
}

app.whenReady().then(init);

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
