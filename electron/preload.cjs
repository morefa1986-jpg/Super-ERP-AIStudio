const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("fathiDesktop", Object.freeze({
  platform: process.platform,
  version: process.versions.electron,
  offlineRuntime: true,
}));
