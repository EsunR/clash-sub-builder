import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import toml from "toml";
import yaml from "yaml";
import { CONFIG_DIR_PATH, SUBSCRIBES_DIR_PATH } from "../constance.ts";
import { getTemplateFromGist } from "./gist.ts";
import { VnstatConfigItem } from "./vnstatChecker.ts";

/**
 * 获取 Groups 配置
 * @returns custom groups array
 */
export function getGroups(): Array<ProxyGroupItem> {
    const groupConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "groups.toml"),
        "utf-8"
    );
    const groupConfigParsed = toml.parse(groupConfig);
    return groupConfigParsed.custom_groups;
}

/**
 * 获取 Rulesets 配置
 * @returns custom rulesets array
 */
export function getRulesets() {
    const rulesetsConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "rulesets.toml"),
        "utf-8"
    );
    const rulesetsConfigParsed = toml.parse(rulesetsConfig);
    return rulesetsConfigParsed.rulesets as RulesetsItem[];
}

/**
 * 获取 Clash 模板
 * @returns promise resolving to clash template array
 */
export async function getClashTemplates(): Promise<Array<Template>> {
    // 读取远程 gist 中的模板
    const templateFromGist = await getTemplateFromGist();
    if (templateFromGist) {
        return [
            {
                name: "template.yml",
                yaml: yaml.parse(templateFromGist),
            },
        ];
    }

    const filePaths = fs
        .readdirSync(SUBSCRIBES_DIR_PATH)
        .filter((file) => file.endsWith(".yml") && !file.startsWith("_"))
        .map((file) => path.resolve(SUBSCRIBES_DIR_PATH, file));

    // 读取本地模板
    const templateFilesContent = filePaths.map((file) => {
        return fs.readFileSync(file, "utf-8");
    });

    return templateFilesContent.map((content, index) => ({
        name: path.basename(filePaths[index]),
        yaml: yaml.parse(content),
    }));
}

/**
 * 获取 gist 配置
 * @returns gist config object
 */
export function getGistConfig(): { token: string; id: string } {
    // 环境变量模式
    const { GIST_TOKEN, GIST_ID } = process.env;

    // 配置文件模式
    const gistConfig = fs.readFileSync(
        path.resolve(CONFIG_DIR_PATH, "gist.toml"),
        "utf-8"
    );
    const tomlConfig = toml.parse(gistConfig).common[0];

    return {
        token: GIST_TOKEN || tomlConfig.token,
        id: GIST_ID || tomlConfig.id,
    };
}

export function getVnstatConfig(): Array<VnstatConfigItem> {
    const vnstatConfigPath = path.resolve(CONFIG_DIR_PATH, "vnstat.toml");
    if (!fs.existsSync(vnstatConfigPath)) {
        return [];
    }
    const vnstatConfigContent = fs.readFileSync(vnstatConfigPath, "utf-8");
    const vnstatConfigParsed = toml.parse(vnstatConfigContent);
    return vnstatConfigParsed.server || [];
}
