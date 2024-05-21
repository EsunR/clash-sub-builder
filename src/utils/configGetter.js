import fs from "fs";
import path from "path";
import toml from "toml";
import yaml from "yaml";
import { CONFIG_DIR_PATH } from "../constance.js";
import { getTemplateFromGist } from "./gist.js";

/**
 * 获取 Groups 配置
 * @returns {Array.<Object>} custom groups array
 */
export function getGroups() {
    const groupConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "groups.toml"),
        "utf-8"
    );
    const groupConfigParsed = toml.parse(groupConfig);
    return groupConfigParsed.custom_groups;
}

/**
 * 获取 Rulesets 配置
 * @returns {Array.<Object>} custom rulesets array
 */
export function getRulesets() {
    const rulesetsConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "rulesets.toml"),
        "utf-8"
    );
    const rulesetsConfigParsed = toml.parse(rulesetsConfig);
    return rulesetsConfigParsed.rulesets;
}

/**
 * 获取 Clash 模板
 * @returns {Object} clash template
 */
export async function getClashTemplate() {
    // 读取远程 gits 中的模板
    const templateFromGist = await getTemplateFromGist();
    if (templateFromGist) {
        return yaml.parse(templateFromGist);
    }
    // 读取本地模板
    const template = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "template.yml"),
        "utf-8"
    );
    return yaml.parse(template);
}

/**
 * 获取 gist 配置
 * @returns {Object} gist config
 */
export function getGistConfig() {
    // 环境变量模式
    const { GIST_TOKEN, GIST_ID, GIST_FILE_NAME } = process.env;
    // 配置文件模式
    const gistConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "gist.toml"),
        "utf-8"
    );
    const tomlConfig = toml.parse(gistConfig).common[0];
    return {
        token: GIST_TOKEN || tomlConfig.token,
        id: GIST_ID || tomlConfig.id,
        filename: GIST_FILE_NAME || tomlConfig.filename,
    };
}
