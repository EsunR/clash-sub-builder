import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { log } from "./log.ts";
import { listParser } from "./parser.ts";
import { GROUP_WHITE_LIST, RULE_WHITE_LIST } from "../constance.ts";
import { listRuleFormatter } from "./formatter.ts";
import dayjs from "dayjs";

/**
 * 生成 Proxies yml 配置
 * @param proxies 节点配置数组
 */
export function generateProxies(
    proxies: Array<ClashProxiesItem>
): Array<{ name: string }> {
    if (!(Array.isArray(proxies) && proxies.length > 0)) {
        if (process.env.NODE_ENV === "development") {
            log("warn", "请在 template.yml 中添加 proxies 节点配置");
        } else {
            throw new Error("请在 template.yml 中添加 proxies 节点配置");
        }
    }
    return proxies.map((proxy) => {
        proxy.name = `${proxy.name} [v${dayjs().format("MMDD")}]`;
        return proxy;
    });
}

/**
 * 生成 Clash 配置文件 ProxyGroups 字段的配置
 * @param proxies 节点配置数组
 * @param groupsConfig 分组配置数组
 */
export function generateProxyGroups(
    proxies: Array<ClashProxiesItem>,
    groupsConfig: Array<ProxyGroupItem>
) {
    const proxyNames = proxies?.map((item) => item.name) ?? [];
    const groupNames = groupsConfig?.map((item) => item.name) ?? [];
    const result: Array<ClashProxyGroupItem> = [];

    for (const group of groupsConfig) {
        const groupConfig = {
            name: group.name,
            type: group.type,
            url: group.url,
            interval: group.interval,
            proxies: [] as string[],
        };

        for (const rule of group.rule) {
            const proxyRegExp = new RegExp(rule);
            // 先判断 rule 有没有命中 proxyNames
            const matchedProxyNames = proxyNames.filter((item) =>
                proxyRegExp.test(item)
            );
            if (matchedProxyNames.length > 0) {
                groupConfig.proxies.push(...matchedProxyNames);
                groupConfig.proxies = [...new Set(groupConfig.proxies)];
                continue;
            }
            // 再判断 rule 有没有命中 groupNames
            const matchedGroupNames = groupNames.filter((item) =>
                proxyRegExp.test(item)
            );
            if (matchedGroupNames.length > 0) {
                groupConfig.proxies.push(...matchedGroupNames);
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
 * @param rulesets 规则集配置数组
 * @param groupsConfig 分组配置数组
 */
export function generateRules(
    rulesets: Array<{ group: string; ruleset: string }>,
    groupsConfig: Array<{ name: string }>
): string[] {
    const groupNames = groupsConfig.map((item) => item.name);
    const addedRules: string[] = [];
    const rules: string[] = [];

    for (const ruleset of rulesets) {
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
            const rulesPart: string[] = [];
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

export function transBit2Gb(bit: number): number {
    return bit / 1024 / 1024 / 1024;
}

export function transGb2Bit(gb: number): number {
    return gb * 1024 * 1024 * 1024;
}