import fs from "fs";
import path from "path";
import { log } from "./log.js";
import { listParser } from "./parser.js";
import { GROUP_WHITE_LIST, RULE_WHITE_LIST } from "../constance.js";
import { listRuleFormatter } from "./formatter.js";
import dayjs from "dayjs";

/**
 * 生成 Proxies yml 配置
 * @param {Array.<Object>} proxies
 */
export function generateProxies(proxies) {
    if (!(proxies instanceof Array && proxies.length > 0)) {
        if (process.env.NODE_ENV === "development") {
            log("warn", "请在 template.yml 中添加 proxies 节点配置");
        } else {
            log("error", "请在 template.yml 中添加 proxies 节点配置");
        }
    }
    return (proxies ?? []).map((proxy) => {
        proxy.name = `${proxy.name} [v${dayjs().format("MMDD")}]`;
        return proxy;
    });
}

/**
 * 生成 Groups yml 配置
 * @param {Array.<Object>} proxies 节点配置
 * @param {Array.<Object>} groupsConfig
 */
export function generateProxyGroups(proxies, groupsConfig) {
    if (!(proxies instanceof Array && proxies.length > 0)) {
        if (process.env.NODE_ENV === "development") {
            log("warn", "请在 template.yml 中添加 proxies 节点配置");
        } else {
            log("error", "请在 template.yml 中添加 proxies 节点配置");
        }
    }
    const proxyNames = proxies?.map((item) => item.name) ?? [];
    const groupNames = groupsConfig?.map((item) => item.name) ?? [];
    const result = [];
    for (const group of groupsConfig) {
        const groupConfig = {
            name: group.name,
            type: group.type,
            url: group.url,
            interval: group.interval,
            proxies: [],
        };
        for (const rule of group.rule) {
            const proxyRegExp = new RegExp(rule);
            // 先判断 rule 有没有命中 proxyNames
            const matchedProxyNames = proxyNames.filter((item) =>
                proxyRegExp.test(item)
            );
            if (matchedProxyNames.length > 0) {
                groupConfig.proxies.push(...matchedProxyNames);
                // 去重
                groupConfig.proxies = [...new Set(groupConfig.proxies)];
                continue;
            }
            // 再判断 rule 有没有命中 groupNames
            const matchedGroupNames = groupNames.filter((item) =>
                proxyRegExp.test(item)
            );
            if (matchedGroupNames.length > 0) {
                groupConfig.proxies.push(...matchedGroupNames);
                // 去重
                groupConfig.proxies = [...new Set(groupConfig.proxies)];
                continue;
            }
            if (GROUP_WHITE_LIST.includes(rule)) {
                groupConfig.proxies.push(rule);
                continue;
            }
            log("warn", `规则 ${rule} 未命中任何节点，已忽略`);
        }
        result.push(groupConfig);
    }
    return result;
}

/**
 * 生成 Rules yml 配置
 * @param {Array.<Object>} rulesets
 * @param {Array.<Object>} groupsConfig
 */
export function generateRules(rulesets, groupsConfig) {
    const groupNames = groupsConfig.map((item) => item.name);
    const addedRules = [];
    const rules = [];
    for (let ruleset of rulesets) {
        const group = ruleset.group;
        if (!groupNames.includes(group)) {
            log("warn", `规则集中的 group:${group} 不存在，已忽略`);
            continue;
        }
        const rulesetConfig = ruleset.ruleset;
        // 判断是否是有效文件
        if (fs.existsSync(path.resolve(rulesetConfig))) {
            const rulesFileContent = fs.readFileSync(
                path.resolve(rulesetConfig),
                "utf-8"
            );
            const rulesPart = [];
            let repeatCounter = 0;
            listParser(rulesFileContent).forEach((item) => {
                // 去重
                if (addedRules.includes(item)) {
                    repeatCounter++;
                    return;
                }
                rulesPart.push(listRuleFormatter(item, group));
                addedRules.push(item);
            });
            rules.push(...rulesPart);
            log(
                "info",
                `规则集 ${rulesetConfig} 已添加到分组 ${group} 中, 共计 ${rulesPart.length} 条，去重 ${repeatCounter} 条`
            );
            continue;
        } else if (RULE_WHITE_LIST.includes(rulesetConfig)) {
            rules.push(listRuleFormatter(rulesetConfig, group));
            log("info", `规则 ${rulesetConfig} 已添加到分组 ${group} 中`);
            continue;
        }
        throw new Error(`规则集 ${rulesetConfig} 不存在`);
    }
    const notEmptyRules = rules.filter((item) => !!item);
    log("info", `规则生成完毕，共计 ${notEmptyRules.length} 条规则`);
    return notEmptyRules;
}
