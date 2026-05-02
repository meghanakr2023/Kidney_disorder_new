const { app, BrowserWindow, shell } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const http = require('http')

let mainWindow
let backendProcess

function waitForBackend(callback, retries = 30) {
  http.get('http://localhost:8000/health', (res) => {
    if (res.statusCode === 200) {
      callback()
    } else {
      retry(callback, retries)
    }
  }).on('error', () => retry(callback, retries))
}

function retry(callback, retries) {
  if (retries <= 0) {
    console.error('Backend failed to start')
    return
  }
  setTimeout(() => waitForBackend(callback, retries - 1), 1000)
}

function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend')
  const pythonPath = path.join(backendPath, 'myenv', 'Scripts', 'python.exe')

  backendProcess = spawn(pythonPath, ['run.py'], {
    cwd: backendPath,
    env: { ...process.env },
    windowsHide: true,
  })

  backendProcess.stdout.on('data', (data) => {
    console.log('Backend:', data.toString())
  })

  backendProcess.stderr.on('data', (data) => {
    console.error('Backend error:', data.toString())
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'KidneyScan AI',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#f0f4f8',
  })

  // Show loading screen first
  mainWindow.loadURL(`data:text/html,
    <html>
      <body style="margin:0; background:#f0f4f8; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <div style="font-size:48px; margin-bottom:16px;">🫁</div>
        <h2 style="color:#1565c0; margin:0 0 8px">KidneyScan AI</h2>
        <p style="color:#7a93b5; margin:0">Starting up, please wait...</p>
        <div style="margin-top:24px; width:40px; height:40px; border:3px solid #dce4ed; border-top-color:#1565c0; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      </body>
    </html>
  `)

  mainWindow.show()

  // Wait for backend then load app
  waitForBackend(() => {
    mainWindow.loadURL('http://localhost:3000')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})