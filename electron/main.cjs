const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Security: Disable Node integration in renderer
// Security: Enable context isolation
// Security: Enable sandbox

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      // SECURITY: Disable Node.js integration in renderer
      nodeIntegration: false,

      // SECURITY: Enable context isolation
      contextIsolation: true,

      // SECURITY: Enable sandbox
      sandbox: true,

      // SECURITY: Disable remote module
      enableRemoteModule: false,

      // SECURITY: Disable web security in dev only (for CORS during development)
      webSecurity: !isDev,

      // Preload script for secure IPC communication
      preload: path.join(__dirname, 'preload.cjs'),

      // FIX: Input focus issues - enable DOM storage
      webviewTag: false,

      // FIX: Prevent input lag
      spellcheck: false,

      // FIX: Better performance for inputs
      backgroundThrottling: false,
    },
    // Nigerian business-friendly branding
    title: 'StockPoint - Business Management',
    backgroundColor: '#0f172a',
    show: false, // Don't show until ready

    // FIX: Improve input handling
    autoHideMenuBar: true,

    // FIX: Better rendering
    useContentSize: false,
  });

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL('http://localhost:5176');
    // DevTools can be opened manually with Ctrl+Shift+I
  } else {
    // Production: Load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // FIX: Ensure inputs are focusable by injecting CSS
    mainWindow.webContents.insertCSS(`
      input, textarea, select {
        -webkit-user-select: text !important;
        user-select: text !important;
        pointer-events: auto !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: 2px solid #4f46e5 !important;
      }
    `);
  });

  // FIX: Re-enable input focus after any page load
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Ensure all inputs can receive focus
      document.addEventListener('DOMContentLoaded', () => {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.style.webkitUserSelect = 'text';
          input.style.userSelect = 'text';
        });
      });
    `);
  });

  // SECURITY: Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const validOrigins = [
      'http://localhost:5176', // Dev server
      'http://localhost:3001', // Backend dev
      'https://api.paystack.co', // Paystack payment
    ];

    // Allow localhost and Paystack only
    if (!validOrigins.some(origin => navigationUrl.startsWith(origin))) {
      event.preventDefault();
      console.warn('Navigation blocked:', navigationUrl);
    }
  });

  // SECURITY: Prevent opening new windows (open in external browser instead)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Paystack payment popup
    if (url.includes('paystack.co') || url.includes('checkout.paystack')) {
      shell.openExternal(url);
    } else {
      console.warn('Window open blocked:', url);
    }
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// SECURITY: Disable hardware acceleration if needed
// app.disableHardwareAcceleration();

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// SECURITY: Handle IPC messages securely
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// SECURITY: Validate all IPC calls
ipcMain.on('app-message', (event, message) => {
  console.log('Received message:', message);
  // Add validation here
});

// SECURITY: Log security warnings
process.on('warning', (warning) => {
  console.warn('Security Warning:', warning.name, warning.message);
});

console.log('🚀 StockPoint Desktop started');
console.log('Environment:', isDev ? 'Development' : 'Production');
console.log('User Data Path:', app.getPath('userData'));
