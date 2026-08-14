const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

if (require("electron-squirrel-startup")) app.quit();

const isServerMode = process.argv.includes("--server");
let serverProcess = null;
let shuttingDown = false;
let restartTimer = null;

function findFreePort() {
  if (isServerMode) return Promise.resolve(Number(process.env.PORT) || 3000);
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : 3000;
      probe.close(() => resolve(port));
    });
  });
}

function serverBundlePath() {
  return path.join(app.getAppPath(), "dist", "server.cjs");
}

function startLocalServer(port) {
  const child = spawn(process.execPath, [serverBundlePath()], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(port),
      HOST: isServerMode ? (process.env.HOST || "0.0.0.0") : "127.0.0.1",
      FATHI_ERP_DATA_DIR: process.env.FATHI_ERP_DATA_DIR || app.getPath("userData"),
      FATHI_ERP_DIST_DIR: path.join(app.getAppPath(), "dist"),
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.stdout.on("data", (data) => console.log(`[server] ${String(data).trimEnd()}`));
  child.stderr.on("data", (data) => console.error(`[server] ${String(data).trimEnd()}`));
  child.once("exit", (code) => {
    serverProcess = null;
    if (!shuttingDown) {
      console.error(`[desktop] Local server stopped (${code}); restarting.`);
      restartTimer = setTimeout(() => startLocalServer(port), 2_000);
    }
  });
  serverProcess = child;
}

function waitForServer(port, timeoutMs = 30_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = http.get(`http://127.0.0.1:${port}/api/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) return resolve();
        retry();
      });
      request.setTimeout(1_000, () => request.destroy());
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) return reject(new Error("Local server startup timed out."));
      setTimeout(probe, 250);
    };
    probe();
  });
}

function createWindow(port) {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: "#071a2a",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    const allowed = new URL(`http://127.0.0.1:${port}`);
    const target = new URL(url);
    if (target.origin !== allowed.origin) event.preventDefault();
  });
  window.once("ready-to-show", () => window.show());
  window.loadURL(`http://127.0.0.1:${port}`);
}

async function boot() {
  const port = await findFreePort();
  startLocalServer(port);
  await waitForServer(port);
  if (isServerMode) {
    console.log(`[desktop] Permanent LAN server is active on port ${port}.`);
    return;
  }
  createWindow(port);
}

const hasLock = app.requestSingleInstanceLock({ mode: isServerMode ? "server" : "desktop" });
if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
  app.whenReady().then(boot).catch((error) => {
    console.error(error);
    app.exit(1);
  });
}

app.on("window-all-closed", () => {
  if (!isServerMode) app.quit();
});

app.on("before-quit", () => {
  shuttingDown = true;
  if (restartTimer) clearTimeout(restartTimer);
  if (serverProcess) serverProcess.kill("SIGTERM");
});
