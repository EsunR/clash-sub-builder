import fs from "fs";
import toml from "toml";
import path from "path";
import yaml from "yaml";
import { CONFIG_DIR_PATH } from "../constance.js";

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
export function getClashTemplate() {
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
    const gistConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "gist.toml"),
        "utf-8"
    );
    return toml.parse(gistConfig);
}
