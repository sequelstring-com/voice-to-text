// const { app, BrowserWindow, ipcMain } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { execSync } = require("child_process");
// const record = require("node-record-lpcm16");
// const recording = record.record();

// const MODEL_PATH = path.join(__dirname, "../models/ggml-large-v3.bin");
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
//   win.loadURL("http://localhost:3000");
// }

// app.whenReady().then(createWindow);

// ipcMain.handle("start-listening", async () => {
//   if (isRecording) {
//     console.log("⚠️ Already recording, skipping duplicate call.");
//     return "Recording already in progress.";
//   }

//   isRecording = true;

//   const tempDir = path.join(__dirname, "../temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//   const rawFile = path.join(tempDir, "recording.wav");
//   const cleanFile = path.join(tempDir, "cleaned.wav");

//   // 🧹 Remove previous temp files
//   [rawFile, cleanFile, cleanFile + ".txt"].forEach((f) => {
//     if (fs.existsSync(f)) fs.unlinkSync(f);
//   });

//   try {
//     console.log("🎙️ Recording mic for 6 seconds...");
//     const wav = fs.createWriteStream(rawFile);

//     record
//       .record({
//         sampleRateHertz: 16000,
//         channels: 1,
//         threshold: 0.5,
//         recordProgram: "sox",
//       })
//       .stream()
//       .pipe(wav);

//     await new Promise((r) => setTimeout(r, 6000));
//     recording.stop();
//     console.log("🛑 Recording stopped.");

//     // ✂️ Trim silence and normalize
//     console.log("🔊 Cleaning and normalizing audio...");
//     execSync(
//       `sox "${rawFile}" "${cleanFile}" silence 1 0.1 1% 1 0.5 1% highpass 50 lowpass 4000 norm`,
//       { stdio: "inherit" }
//     );

//     // 🧠 Run Whisper transcription — add flags to reduce punctuation
//     console.log("🧠 Running Whisper transcription...");
//     const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${cleanFile}" -l en --temperature 0.0 --beam-size 5 --best-of 5 --prompt "User is speaking short clear English letters or numbers" --no-timestamps -otxt`;
//     execSync(cmd, { stdio: "inherit" });

//     // 📖 Read result
//     let result = fs.readFileSync(cleanFile + ".txt", "utf8").trim();

//     // 🧹 Clean punctuation and repeated commas/periods
//     result = result.replace(/[.,!?]+/g, " ").replace(/\s+/g, " ").trim();

//     console.log("✅ Final recognized text:", result);

//     // 🧽 Cleanup
//     [rawFile, cleanFile, cleanFile + ".txt"].forEach((f) => {
//       if (fs.existsSync(f)) fs.unlinkSync(f);
//     });

//     return result;
//   } catch (err) {
//     console.error("❌ Error during offline recognition:", err);
//     return "Error in Whisper.";
//   } finally {
//     isRecording = false;
//   }
// });




const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const record = require("node-record-lpcm16");
const recording = record.record();
const { exec } = require("child_process");
const ExcelJS = require("exceljs");
const { startWhisper, transcribe } = require("./whisperService");



const MODEL_PATH = path.join(__dirname, "../models/ggml-large-v3.bin");
//const MODEL_PATH = path.join(__dirname, "../models/ggml-medium.en.bin");

const WHISPER_PATH = path.join(__dirname, "../whisper.cpp/bin/whisper-cli");

if (!fs.existsSync(MODEL_PATH)) {
  console.error("❌ Missing model. Download ggml-large-v3.bin from HuggingFace.");
  app.quit();
}

let isRecording = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL("http://localhost:3000");
}

//app.whenReady().then(createWindow);

app.whenReady().then(() => {
  startWhisper();   // 🔥 Load Whisper once
  createWindow();
});

// ipcMain.handle("start-listening", async () => {
//   if (isRecording) {
//     console.log("⚠️ Already recording, skipping duplicate call.");
//     return "Recording already in progress.";
//   }

//   isRecording = true;

//   const tempDir = path.join(__dirname, "../temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//   const rawFile = path.join(tempDir, "recording.wav");
//   const cleanFile = path.join(tempDir, "cleaned.wav");

//   // Clean up previous files
//   [rawFile, cleanFile].forEach((f) => {
//     if (fs.existsSync(f)) fs.unlinkSync(f);
//   });

//   try {
//     console.log("[electron-start] 🎙️ Recording started...");
//     const wav = fs.createWriteStream(rawFile);

//     const recording = record.record({
//       sampleRateHertz: 16000,
//       channels: 1,
//       threshold: 0.5,
//       recordProgram: "sox",
//     });

//     recording.stream().pipe(wav);

//     // record for 3 seconds (shorter for faster response)
//     await new Promise((r) => setTimeout(r, 4000));
//     recording.stop();
//     console.log("[electron-start] 🛑 Recording stopped.");

//     // Clean and normalize audio
//     console.log("[electron-start] 🔊 Cleaning and normalizing audio...");
//     execSync(
//       `sox "${rawFile}" "${cleanFile}" silence 1 0.1 1% 1 0.5 1% highpass 50 lowpass 4000 norm`,
//       { stdio: "inherit" }
//     );

//     // Transcribe via persistent Whisper
//     console.time("whisper-time");
//     console.log("[electron-start] 🧠 Sending audio to persistent Whisper...");
//     const result = await transcribe(cleanFile);
//     console.timeEnd("whisper-time");

//     let text = result.trim();

//     // Sanitize: convert "dash" → "-" and number words → digits
//     const numMap = {
//       zero: "0",
//       one: "1",
//       two: "2",
//       three: "3",
//       four: "4",
//       five: "5",
//       six: "6",
//       seven: "7",
//       eight: "8",
//       nine: "9",
//       ten: "10",
//     };
//     text = text
//       .replace(/\b(dash|minus)\b/gi, "-")
//       .split(/\b/)
//       .map((t) => numMap[t.toLowerCase()] || t)
//       .join("")
//       .replace(/\s*-\s*/g, "-")
//       .replace(/[.,!?]+/g, " ")
//       .trim();

//     console.log("[electron-start] ✅ Final recognized text:", text);
//     return text;

//   } catch (err) {
//     console.error("[electron-start] ❌ Error during offline recognition:", err);
//     return "Error in Whisper.";
//   } finally {
//     isRecording = false;
//   }
// });

ipcMain.handle("start-listening", async () => {
  if (isRecording) {
    console.log("⚠️ Already recording, skipping duplicate call.");
    return "Recording already in progress.";
  }

  isRecording = true;

  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const rawFile = path.join(tempDir, "recording.wav");
  const fixedFile = path.join(tempDir, "fixed.wav");
  const txtFile = fixedFile + ".txt";

  [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));

  try {
    console.log("[electron-start] 🎙️ Recording started...");
    const wav = fs.createWriteStream(rawFile);

    const rec = record.record({
      sampleRateHertz: 16000,
      channels: 1,
      threshold: 0.3, // lower threshold to ensure it records quiet users
      recordProgram: "sox",
      soxArgs: ["gain", "-n", "highpass", "50", "lowpass", "4000", "norm"],
    });

    const micStream = rec.stream();
    micStream.pipe(wav);

    // record for ~3s to ensure enough samples
    await new Promise((r) => setTimeout(r, 4000));
    rec.stop();
    console.log("[electron-start] 🛑 Recording stopped.");

    // wait for header flush
    await new Promise((r) => setTimeout(r, 200));
    wav.end();

    // ensure it has real data
    if (!fs.existsSync(rawFile) || fs.statSync(rawFile).size < 2000) {
      throw new Error("Empty or silent recording (too short).");
    }

    console.log("[electron-start] 🩹 Fixing and normalizing audio...");
    // normalize, add 0.5s padding at end, force 16 kHz
    execSync(
      `sox "${rawFile}" "${fixedFile}" rate 16k pad 0 0.5 gain -n highpass 50 lowpass 4000 norm`,
      { stdio: "ignore" }
    );

    // double-check file size
    if (fs.statSync(fixedFile).size < 2000) {
      throw new Error("Audio too quiet after normalization.");
    }

    // 🧠 Whisper transcription
    console.log("[electron-start] 🧠 Running Whisper...");
    const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${fixedFile}" -l en --temperature 0.0 --beam-size 3 --best-of 3 --no-timestamps -otxt`;
    execSync(cmd, { stdio: "ignore" });

    if (!fs.existsSync(txtFile)) {
      console.warn("[electron-start] ⚠️ Whisper produced no text, inserting fallback.");
      fs.writeFileSync(txtFile, ""); // create empty txt
    }

    let result = fs.readFileSync(txtFile, "utf8").trim();
    if (!result) {
      result = "No speech detected.";
    }

    // clean punctuation
    result = result.replace(/[.,!?]+/g, " ").replace(/\s+/g, " ").trim();

    // convert spoken numbers to digits
    const map = {
      zero: "0", one: "1", two: "2", three: "3", four: "4",
      five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
    };
    const isNumeric = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|point|dot|\s)+$/i.test(result);
    if (isNumeric) {
      result = result
        .toLowerCase()
        .split(/\s+/)
        .map((w) => (w === "point" || w === "dot") ? "." : map[w] || w)
        .join("")
        .trim();
    }

    result = result
      .replace(/\b[dD]ash\b/g, "-")  // replaces spoken "dash" with symbol
      .replace(/\s*-\s*/g, "-")      // remove spaces around hyphens
      .trim();


    console.log("[electron-start] ✅ Final recognized text:", result);

    // cleanup async
    setTimeout(() => [rawFile, fixedFile, txtFile].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f)), 1000);

    return result;
  } catch (err) {
    console.error("[electron-start] ❌ Error during offline recognition:", err);
    return "Error in Whisper: " + err.message;
  } finally {
    isRecording = false;
  }
});


// ipcMain.handle("start-listening", async () => {
//   if (isRecording) {
//     console.log("⚠️ Already recording, skipping duplicate call.");
//     return "Recording already in progress.";
//   }

//   isRecording = true;

//   const tempDir = path.join(__dirname, "../temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//   const rawFile = path.join(tempDir, "recording.wav");
//   const cleanFile = path.join(tempDir, "cleaned.wav");

//   [rawFile, cleanFile, cleanFile + ".txt"].forEach((f) => {
//     if (fs.existsSync(f)) fs.unlinkSync(f);
//   });

//   try {
//     console.log("🎙️ Recording mic for 6 seconds...");
//     const wav = fs.createWriteStream(rawFile);

//     record
//       .record({
//         sampleRateHertz: 16000,
//         channels: 1,
//         threshold: 0.5,
//         recordProgram: "sox",
//       })
//       .stream()
//       .pipe(wav);

//     await new Promise((r) => setTimeout(r, 6000));
//     recording.stop();
//     console.log("🛑 Recording stopped.");

//     // ✂️ Trim silence and normalize
//     console.log("🔊 Cleaning and normalizing audio...");
//     execSync(
//       `sox "${rawFile}" "${cleanFile}" silence 1 0.1 1% 1 0.5 1% highpass 50 lowpass 4000 norm`,
//       { stdio: "inherit" }
//     );

//     // 🧠 Run Whisper transcription
//     console.log("🧠 Running Whisper transcription...");
//     const cmd = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${cleanFile}" -l en --temperature 0.0 --beam-size 5 --best-of 5 --prompt "User is saying short clear answers, numbers or small phrases" --no-timestamps -otxt`;
//     execSync(cmd, { stdio: "inherit" });

//     let result = fs.readFileSync(cleanFile + ".txt", "utf8").trim();

//     // 🧹 Clean punctuation
//     result = result.replace(/[.,!?]+/g, " ").replace(/\s+/g, " ").trim();

//     // 🔢 Convert number words → digits
//     const map = {
//       zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
//       six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
//     };

//     const decimalFix = (text) => {
//       let out = "";
//       const parts = text.toLowerCase().split(/\s+/);
//       for (const p of parts) {
//         if (p === "point" || p === "dot") out += ".";
//         else out += map[p] || p;
//       }
//       return out;
//     };

//     // Only convert if Whisper mostly returned number words
//     if (/^(zero|one|two|three|four|five|six|seven|eight|nine|ten|point|dot|\s)+$/i.test(result)) {
//       result = decimalFix(result);
//     }

//     console.log("✅ Final recognized text:", result);

//     [rawFile, cleanFile, cleanFile + ".txt"].forEach((f) => {
//       if (fs.existsSync(f)) fs.unlinkSync(f);
//     });

//     return result;
//   } catch (err) {
//     console.error("❌ Error during offline recognition:", err);
//     return "Error in Whisper.";
//   } finally {
//     isRecording = false;
//   }
// });


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























