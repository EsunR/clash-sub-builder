import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const ROOT_PATH = path.resolve(__dirname, "../");
export const SRC_DIR_PATH = path.resolve(__dirname, "../src");
export const CONFIG_DIR_PATH = path.resolve(__dirname, "../config");
export const RULES_DIR_PATH = path.resolve(__dirname, "../rules");

export const GROUP_WHITE_LIST = ["DIRECT", "REJECT"];
export const RULE_WHITE_LIST = ["[]GEOIP,CN", "[]FINAL"];
