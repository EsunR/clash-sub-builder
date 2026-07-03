import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const ROOT_PATH: string = path.resolve(__dirname, "../");
export const SRC_DIR_PATH: string = path.resolve(__dirname, "../src");
export const CONFIG_DIR_PATH: string = path.resolve(__dirname, "../config");
export const SUBSCRIBES_DIR_PATH: string = path.resolve(CONFIG_DIR_PATH, "subscribes");
export const RULES_DIR_PATH: string = path.resolve(__dirname, "../rules");

export const GROUP_WHITE_LIST: string[] = ["DIRECT", "REJECT"];
export const RULE_WHITE_LIST: string[] = ["[]GEOIP,CN", "[]FINAL"];
