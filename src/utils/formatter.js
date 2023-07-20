/**
 * 将 .list 规则列表中的单条规则转换为 clash 规则
 * @param {String} rule 单条规则
 * @param {String} group 规则分组
 */
export function listRuleFormatter(rule, group) {
    let formattedRule = `${rule},${group}`.replace("[]", "");
    // 是否是 USER-AGENT / URL-REGEX 规则, clash 暂不支持该类规则
    if (rule.startsWith("USER-AGENT") || rule.startsWith("URL-REGEX")) {
        formattedRule = "";
        return formattedRule;
    }
    // 是否是 no-resolve 规则
    if (formattedRule.includes(",no-resolve")) {
        const pure = formattedRule.replace(",no-resolve", "");
        formattedRule = `${pure},no-resolve`;
    }
    if (formattedRule.startsWith("FINAL")) {
        formattedRule = formattedRule.replace("FINAL", "MATCH");
    }
    return formattedRule;
}
