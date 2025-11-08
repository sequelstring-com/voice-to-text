const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.default = async function () {
  try {
    const dmgDir = path.resolve("dist");
    const dmgFiles = fs.readdirSync(dmgDir).filter(f => f.endsWith(".dmg"));
    for (const file of dmgFiles) {
      const dmgPath = path.join(dmgDir, file);
      execSync(`xattr -dr com.apple.quarantine "${dmgPath}" || true`);
      execSync(`xattr -dr com.apple.provenance "${dmgPath}" || true`);
      console.log(`✅ Removed quarantine + provenance from DMG: ${file}`);
    }
  } catch (e) {
    console.warn("⚠️ afterAllArtifactBuild cleanup failed:", e.message);
  }
};
