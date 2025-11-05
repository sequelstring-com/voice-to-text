const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ preload.js loaded");


contextBridge.exposeInMainWorld("electronAPI", {
  startListening: () => ipcRenderer.invoke("start-listening"),
  exportExcel: (data) => ipcRenderer.invoke("export-excel", data),
});