const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const MODEL_PATH = path.join(__dirname, "../models/ggml-large-v3.bin");
const WHISPER_PATH = path.join(__dirname, "../whisper.cpp/bin/whisper-cli");

// Keep model in memory using warm load cache
let whisperCacheReady = false;

async function transcribe(audioPath) {
  if (!fs.existsSync(audioPath)) {
    throw new Error("Audio file not found: " + audioPath);
  }

  console.time("whisper-transcribe");

  return new Promise((resolve, reject) => {
    const args = [
      "-m", MODEL_PATH,
      "-l", "en",
      "--no-timestamps",
      "--no-fallback",
      "--print-progress", "false",
      "-f", audioPath
    ];

    const proc = spawn(WHISPER_PATH, args);
    let output = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.stderr.on("data", (data) => {
      const msg = data.toString();
      if (!/progress|loading/i.test(msg)) console.warn("[whisper-stderr]", msg);
    });

    proc.on("close", (code) => {
      console.timeEnd("whisper-transcribe");
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        reject(new Error("Whisper failed with code " + code));
      }
    });
  });
}

function startWhisper() {
  // Pre-warm: load model once with dummy run (fastens first call)
  if (whisperCacheReady) return;
  console.log("🚀 Preloading Whisper model for faster response...");
  const dummy = spawn(WHISPER_PATH, [
    "-m", MODEL_PATH,
    // "-l", "en",
    "--no-timestamps",
    "--no-fallback",
    "-f", path.join(__dirname, "../assets/silence.wav")
  ], {env: { ...process.env, LANG: "en_US.UTF-8" }});

  dummy.on("close", () => {
    whisperCacheReady = true;
    console.log("✅ Whisper model preloaded in memory.");
  });
}

module.exports = { startWhisper, transcribe };
