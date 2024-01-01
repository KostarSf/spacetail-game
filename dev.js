import chokidar from "chokidar";
import { spawn } from "node:child_process";

let proc = null;

function restartVite() {
  if (proc) proc.kill();
  proc = spawn("vite", { stdio: [0, 0, 0] });
}

chokidar.watch("src/").on("change", restartVite);

restartVite();
