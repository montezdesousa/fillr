import fs from "fs";
import path from "path";

const dest = path.join("build", "chrome-mv3-dev");
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

fs.copyFileSync("modal.js", path.join(dest, "modal.js"));
console.log("Copied modal.js to build folder");