
// const { app, BrowserWindow, ipcMain, shell } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { execSync } = require("child_process");
// const record = require("node-record-lpcm16");
// const recording = record.record();
// const { exec } = require("child_process");
// const ExcelJS = require("exceljs");
// const { startWhisper, transcribe } = require("./whisperService");



// const MODEL_PATH = path.join(__dirname, "../models/ggml-large-v3.bin");
// //const MODEL_PATH = path.join(__dirname, "../models/ggml-medium.en.bin");

// const WHISPER_PATH = path.join(__dirname, "../whisper.cpp/bin/whisper-cli");

// if (!fs.existsSync(MODEL_PATH)) {
//   console.error("❌ Missing model. Download ggml-large-v3.bin from HuggingFace.");
//   app.quit();
// }

// let isRecording = false;

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });
//  // win.loadURL("http://localhost:3000");
//   win.loadFile(path.join(__dirname, "../build/index.html"));

// }

// //app.whenReady().then(createWindow);

// app.whenReady().then(() => {
//   startWhisper();   // 🔥 Load Whisper once
//   createWindow();
// });


// ipcMain.handle("start-listening", async (event, selectedLang = "auto") => {
//   if (isRecording) {
//     console.log("⚠️ Already recording, skipping duplicate call.");
//     return "Recording already in progress.";
//   }

//   isRecording = true;
//   const tempDir = path.join(__dirname, "../temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//   const rawFile = path.join(tempDir, "recording.wav");
//   const fixedFile = path.join(tempDir, "fixed.wav");
//   const txtFile = fixedFile + ".txt";

//   [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));

//   try {
//     console.log(`[electron-start] 🎙️ Recording started for language: ${selectedLang}`);
//     const wav = fs.createWriteStream(rawFile);

//     const rec = record.record({
//       sampleRateHertz: 16000,
//       channels: 1,
//       threshold: 0.3,
//       recordProgram: "sox",
//       soxArgs: ["gain", "-n", "highpass", "50", "lowpass", "4000", "norm"],
//     });

//     const micStream = rec.stream();
//     micStream.pipe(wav);

//     await new Promise((r) => setTimeout(r, 4000));
//     rec.stop();
//     console.log("[electron-start] 🛑 Recording stopped.");

//     await new Promise((r) => setTimeout(r, 200));
//     wav.end();

//     if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 2000) {
//       throw new Error("Empty or silent recording (too short).");
//     }

//     console.log("[electron-start] 🩹 Normalizing audio...");
//     execSync(
//       `sox "${rawFile}" "${fixedFile}" rate 16k pad 0 0.5 gain -n highpass 50 lowpass 4000 norm`,
//       { stdio: "ignore" }
//     );

//     if (fs.statSync(fixedFile).size < 2000) {
//       throw new Error("Audio too quiet after normalization.");
//     }

//     // 🧠 Whisper transcription (language from frontend)
//     console.log("[electron-start] 🧠 Running Whisper...");
//     const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${fixedFile}" --language ${selectedLang} --temperature 0.0 --beam-size 3 --best-of 3 --no-timestamps -otxt`;
//     execSync(cmd, { stdio: "ignore" });

//     let result = fs.existsSync(txtFile) ? fs.readFileSync(txtFile, "utf8").trim() : "";
//     if (!result) result = "No speech detected.";

//     result = result.replace(/[.,!?]+/g, " ").replace(/\s+/g, " ").trim();

//     console.log("[electron-start] ✅ Final recognized text:", result);
//     setTimeout(() => [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f)), 1000);

//     return result;
//   } catch (err) {
//     console.error("[electron-start] ❌ Error during offline recognition:", err);
//     return "Error in Whisper: " + err.message;
//   } finally {
//     isRecording = false;
//   }
// });

// 



// const { app, BrowserWindow, ipcMain } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { execSync, spawn } = require("child_process");

// // Detect packaged vs dev mode
// const isPackaged = app.isPackaged;

// // ✅ Get correct base paths depending on environment
// const getBasePath = () => {
//   return isPackaged
//     ? path.join(process.resourcesPath, "whisper-bin") // inside packaged app
//     : path.join(__dirname, "../whisper.cpp/bin");     // during development
// };

// // ✅ Model and binary paths
// const MODEL_PATH = isPackaged
//   ? path.join(process.resourcesPath, "models/ggml-large-v3.bin")
//   : path.join(__dirname, "../models/ggml-large-v3.bin");

// const WHISPER_PATH = path.join(getBasePath(), "whisper-cli");
// const SOX_PATH = path.join(
//   getBasePath(),
//   process.platform === "win32" ? "sox.exe" : "sox"
// );

// // ✅ Verify critical files exist
// if (!fs.existsSync(MODEL_PATH)) {
//   console.error("❌ Missing Whisper model:", MODEL_PATH);
//   app.quit();
// }

// if (!fs.existsSync(SOX_PATH)) {
//   console.error("❌ Missing SoX binary:", SOX_PATH);
//   app.quit();
// }

// let mainWindow;
// let isRecording = false;

// // ✅ Create main window
// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   const isDev = !app.isPackaged;

//   if (isDev) {
//     // Development: React dev server
//     mainWindow.loadURL("http://localhost:3000");
//     mainWindow.webContents.openDevTools();
//   } else {
//     // Production: Load built React HTML
//     const buildPath = path.join(process.resourcesPath, "app.asar", "build", "index.html");
//     if (fs.existsSync(buildPath)) {
//       mainWindow.loadFile(buildPath);
//     } else {
//       mainWindow.loadFile(path.join(process.resourcesPath, "build", "index.html"));
//     }
//   }

//   mainWindow.on("ready-to-show", () => mainWindow.show());
// }

// app.whenReady().then(() => {
//   createWindow();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// // ✅ IPC: Start recording + transcribe
// ipcMain.handle("start-listening", async (event, selectedLang = "auto") => {
//   if (isRecording) return "Already recording...";
//   isRecording = true;

//   const tempDir = path.join(app.getPath("userData"), "temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//   const rawFile = path.join(tempDir, "recording.wav");
//   const fixedFile = path.join(tempDir, "fixed.wav");
//   const txtFile = fixedFile + ".txt";

//   [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));

//   try {
//     console.log(`[🎙️] Recording in language: ${selectedLang}`);
//     console.log(`[🧩] Using SoX binary: ${SOX_PATH}`);

//     // --- Record using bundled SoX binary ---
//     const recProcess = spawn(SOX_PATH, [
//       "-d", "-c", "1", "-r", "16000", "-b", "16",
//       rawFile, "trim", "0", "4" // Record 4 seconds
//     ]);

//     await new Promise((resolve, reject) => {
//       recProcess.on("close", (code) => {
//         if (code === 0) resolve();
//         else reject(new Error("SoX recording failed"));
//       });
//     });

//     if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 2000)
//       throw new Error("No audio captured (mic permission or silence)");

//     console.log("[🎧] Normalizing audio...");
//     execSync(
//       `"${SOX_PATH}" "${rawFile}" "${fixedFile}" rate 16k pad 0 0.5 gain -n highpass 50 lowpass 4000 norm`
//     );

//     if (!fs.existsSync(fixedFile) || fs.statSync(fixedFile).size < 2000)
//       throw new Error("Audio normalization failed");

//     // --- Run Whisper ---
//     console.log("[🧠] Running Whisper...");
//     const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${fixedFile}" --language ${selectedLang} --temperature 0.0 --beam-size 3 --best-of 3 --no-timestamps -otxt`;
//     execSync(cmd);

//     const result = fs.existsSync(txtFile)
//       ? fs.readFileSync(txtFile, "utf8").trim()
//       : "No speech detected.";

//     console.log("✅ Final recognized text:", result);

//     // Clean up temp files
//     setTimeout(() => {
//       [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
//     }, 1500);

//     return result;
//   } catch (err) {
//     console.error("❌ Error during recognition:", err);
//     return "Error: " + err.message;
//   } finally {
//     isRecording = false;
//   }
// });


const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { execSync, spawn } = require("child_process");

const isPackaged = app.isPackaged;

// ✅ Helper to safely resolve paths for both dev and production
const resolvePath = (relativePath) => {
  if (isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  } else {
    if (relativePath.startsWith("whisper-bin"))
      return path.join(__dirname, "../whisper.cpp/bin", relativePath.replace("whisper-bin/", ""));
    return path.join(__dirname, "..", relativePath);
  }
};

// ✅ Paths
const WHISPER_PATH = resolvePath("whisper-bin/whisper-cli");
const MODEL_PATH = resolvePath("models/ggml-large-v3.bin");
const SOX_PATH = resolvePath(process.platform === "win32" ? "whisper-bin/sox.exe" : "whisper-bin/sox");

console.log("🧩 WHISPER:", WHISPER_PATH);
console.log("🎙️ SOX:", SOX_PATH);

// ✅ Validate resources
[["Whisper binary", WHISPER_PATH], ["Model file", MODEL_PATH], ["SoX binary", SOX_PATH]].forEach(([label, f]) => {
  if (!fs.existsSync(f)) {
    console.error(`❌ Missing ${label}:`, f);
    app.quit();
  }
});

let mainWindow;
let isRecording = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isPackaged) {
    const indexPath = path.join(process.resourcesPath, "app.asar", "build", "index.html");
    mainWindow.loadFile(fs.existsSync(indexPath) ? indexPath : path.join(process.resourcesPath, "build", "index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());

// 🎤 Voice Recording + Transcription
ipcMain.handle("start-listening", async (event, selectedLang = "en") => {
  if (isRecording) return "Already recording...";
  isRecording = true;

  const tempDir = path.join(app.getPath("userData"), "temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const rawFile = path.join(tempDir, "recording.wav");
  const fixedFile = path.join(tempDir, "fixed.wav");
  const txtFile = fixedFile + ".txt";
  [rawFile, fixedFile, txtFile].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

  try {
    console.log("[🎙️] Recording 4s...");

    console.log(`[🎙️] Recording in language: ${selectedLang}`);
    const recProcess = spawn(SOX_PATH, ["-d", "-c", "1", "-r", "16000", "-b", "16", rawFile, "trim", "0", "4"]);

    await new Promise((resolve, reject) => {
      recProcess.on("close", (code) => (code === 0 ? resolve() : reject(new Error("SoX recording failed"))));
    });

    if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 2000)
      throw new Error("No audio captured (mic permission or silence)");

    console.log("[🎧] Cleaning audio...");
    execSync(`"${SOX_PATH}" "${rawFile}" "${fixedFile}" rate 16k pad 0 0.5 gain -n highpass 50 lowpass 4000 norm`);

    console.log("[🧠] Running Whisper...");
    const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${fixedFile}" --language ${selectedLang} --temperature 0.0 --beam-size 3 --best-of 3 --no-timestamps -otxt`;
    execSync(cmd);

    const result = fs.existsSync(txtFile)
      ? fs.readFileSync(txtFile, "utf8").trim()
      : "No speech detected.";

    console.log("✅ Transcription:", result);
    return result;
  } catch (err) {
    console.error("❌ Error during recognition:", err);
    return "Error: " + err.message;
  } finally {
    isRecording = false;
  }
});







ipcMain.handle("export-excel", async (event, data) => {
  try {
    const templatePath = path.join(__dirname, "../ATNM-ODC-MF-014-Daily Welding Production - Visual Inspection Report-Rev 01.xlsx");
    const outputPath = path.join(__dirname, `../ATNM_Welding_Report_${new Date().toISOString().replace(/[:.]/g, "_")}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const ws = workbook.worksheets[0];

    // ========== HEADER SECTION (Preserve Prefix) ==========
    const headerMap = {
      contract_number: "E5",
      contract_title: "K5",
      report_number: "Q5",
      activity_date: "U5",
      po_wo_number: "E6",
      client_wps_number: "K6",
      project_title_well_id: "Q6",
      drawing_no: "E7",
      line_no: "Q7",
      site_name: "U7",
      job_desc: "E8",
      location: "U8",
    };

    const record = data.header || {};
    for (const [key, cellRef] of Object.entries(headerMap)) {
      const cell = ws.getCell(cellRef);
      const existing = cell.value ? String(cell.value).trim() : "";
      const prefix = existing.includes(":") ? existing.split(":")[0] + ":" : existing;
      const val = record[key] ? `${prefix} ${record[key]}` : existing;
      cell.value = val;
    }

    // ========== WELDING TABLE SECTION ==========
    const startRow = 11;
    const tableRows = data.rows || [];

    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      const rowNum = startRow + i * 2;

      ws.getCell(`B${rowNum}`).value = i + 1;
      ws.getCell(`C${rowNum}`).value = row["KP Sec"] || "";
      ws.getCell(`D${rowNum}`).value = row["Weld ID"] || "";
      ws.getCell(`E${rowNum}`).value = row["WPS No"] || "";

      // Material Gr. and Heat No. combined with "/"
      const matGr = row["Material Gr I"] || "";
      const heatNo = row["Material Gr II"] || "";
      ws.getCell(`F${rowNum}`).value = [matGr, heatNo].filter(Boolean).join(" / ");

      ws.getCell(`H${rowNum}`).value = row["Size (Inch)"] || "";
      ws.getCell(`I${rowNum}`).value = row["Size (mm)"] || "";
      ws.getCell(`J${rowNum}`).value = row["Weld Side"] || "";
      ws.getCell(`K${rowNum}`).value = row["Root / Hot"] || "";
      ws.getCell(`L${rowNum}`).value = row["Fill 1"] || "";
      ws.getCell(`M${rowNum}`).value = row["Fill 2"] || "";
      ws.getCell(`N${rowNum}`).value = row["Cap"] || "";
      ws.getCell(`O${rowNum}`).value = row["Fit up"] || "";
      ws.getCell(`P${rowNum}`).value = row["Final"] || "";
      ws.getCell(`Q${rowNum}`).value = row["Mtrl."] || "";
      ws.getCell(`R${rowNum}`).value = row["Comb."] || "";
      ws.getCell(`V${rowNum}`).value = row["Pipe No / Spl. No."] || "";
      ws.getCell(`W${rowNum}`).value = row["Pipe length (mtrs)"] || "";
      ws.getCell(`X${rowNum}`).value = row["Remarks"] || "";
    }

    await workbook.xlsx.writeFile(outputPath);
    shell.openPath(outputPath);
    return { success: true, message: "Excel exported successfully", file: outputPath };

  } catch (err) {
    console.error("❌ Excel export failed:", err);
    return { success: false, error: err.message };
  }
});























