import childProcess from "child_process";
import fs from "fs";
import path from "path";
import { RULES_DIR_PATH } from "../constance.js";
import { log } from "./log.js";

/**
 * 下载最新的 ACL4SSR 规则
 */
export function downloadACL4SSR() {
    log("info", "Downloading ACL4SSR rules...");
    const repoUrl = "https://github.com/ACL4SSR/ACL4SSR.git";
    const downloadPath = path.join(RULES_DIR_PATH, "ACL4SSR");
    if (fs.existsSync(downloadPath)) {
        if (process.env.NODE_ENV === "development") {
            return;
        }
        fs.rmSync(downloadPath, { recursive: true });
    }
    fs.mkdirSync(downloadPath);
    childProcess.execSync(
        `git clone --depth 1 --single-branch --branch master ${repoUrl} ${downloadPath}`
    );
    log("success", "ACL4SSR 最新规则下载成功");
}
