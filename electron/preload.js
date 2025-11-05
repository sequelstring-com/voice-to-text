
console.log("✅ preload.js loaded");


const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startListening: (lang) => ipcRenderer.invoke("start-listening", lang),
});
