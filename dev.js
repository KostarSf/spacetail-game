const chokidar = require("chokidar");
const { spawn } = require("node:child_process");

let proc = null;

function restartVite() {
  if (proc) proc.kill();
  proc = spawn("vite", { stdio: [0, 0, 0] });
}

chokidar.watch("src/").on("change", restartVite);

restartVite();
