// const { execSync } = require("child_process");
// const path = require("path");

// exports.default = async function (context) {
//   const appPath = context.appOutDir;
//   const appName = context.packager.appInfo.productFilename;
//   const appBundle = path.join(appPath, `${appName}.app`);
//   const soxPath = path.join(appBundle, "Contents/Resources/whisper-bin/sox");
//   const entitlementsPath = path.join(context.packager.projectDir, "mic.entitlements");

//   try {
//     console.log("🎤 Signing SoX with mic entitlements...");

//     // Ensure SoX executable
//     execSync(`chmod +x "${soxPath}"`);

//     // Sign SoX with microphone entitlement
//     execSync(
//       `codesign --force --deep --sign - --entitlements "${entitlementsPath}" "${soxPath}"`
//     );
//     console.log("✅ SoX signed with mic entitlement");

//     // Remove quarantine attributes from app
//     execSync(`xattr -cr "${appBundle}"`);

//     // Sign the app, but don’t overwrite internal SoX signature
//     execSync(`codesign --force --deep --sign - "${appBundle}"`);
//     console.log("✅ App signed successfully");

//   } catch (e) {
//     console.warn("⚠️ Post-build step failed:", e.message);
//   }
// };


const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");


exports.default = async function (context) {
  const appPath = context.appOutDir;
  const appName = context.packager.appInfo.productFilename;
  const appBundle = path.join(appPath, `${appName}.app`);
  const soxPath = path.join(appBundle, "Contents/Resources/whisper-bin/sox");

  try {
    // Ensure SoX is executable
    execSync(`chmod +x "${soxPath}"`);
    console.log("✅ Made SoX executable");

    // Clear macOS quarantine & sign
    execSync(`xattr -cr "${appBundle}"`);
    execSync(`codesign --force --deep --sign - "${appBundle}"`);
    console.log("✅ App signed and quarantine removed");
  } catch (e) {
    console.warn("⚠️ Post-build step failed:", e.message);
  }
};

// exports.default = async function (context) {
//   const appPath = context.appOutDir;
//   const appName = context.packager.appInfo.productFilename;
//   const appBundle = path.join(appPath, `${appName}.app`);

//   try {
//     // Remove quarantine flags (prevents “damaged app” errors)
//     execSync(`xattr -dr com.apple.quarantine "${appBundle}"`);
//     console.log("✅ Quarantine flags removed");

//     // Optional ad-hoc signing (for Gatekeeper compatibility)
//     execSync(`codesign --force --deep --options runtime --sign - "${appBundle}"`);
//     console.log("✅ App re-signed ad-hoc successfully");

//   } catch (e) {
//     console.warn("⚠️ afterPack cleanup failed:", e.message);
//   }
// };

