/**
 * 解析 .list 文件规则
 * @param {String} listContent
 * @returns {Array.<String>}
 */
export function listParser(listContent) {
    const lines = listContent.split("\n");
    const rules = [];
    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
            rules.push(trimmedLine);
        }
    });
    return rules;
}
