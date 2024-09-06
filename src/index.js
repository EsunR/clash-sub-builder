import fs from "fs";
import path from "path";
import yaml from "yaml";
import { ROOT_PATH } from "./constance.js";
import {
    getClashTemplates,
    getGroups,
    getRulesets,
} from "./utils/configGetter.js";
import {
    generateProxies,
    generateProxyGroups,
    generateRules,
} from "./utils/index.js";
import { log } from "./utils/log.js";
import { uploadFileToGist } from "./utils/gist.js";
import { downloadACL4SSR } from "./utils/rulesDownloader.js";

async function main() {
    downloadACL4SSR();
    const groups = getGroups();
    const rulesets = getRulesets();
    const templates = await getClashTemplates();
    const subUrls = [];
    for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const fileName = template.name;
        const parsedYaml = template.yaml;
        log(
            "info",
            `=============== ${fileName} process start ===============`
        );
        // set proxies name
        parsedYaml["proxies"] = generateProxies(parsedYaml.proxies);
        // set proxy groups
        const proxyGroups = generateProxyGroups(parsedYaml.proxies, groups);
        parsedYaml["proxy-groups"] = proxyGroups;
        // set rules
        const rules = generateRules(rulesets, groups);
        parsedYaml["rules"] = rules;
        // write to file
        const templateSuffix = fileName
            .replace(path.extname(fileName), "")
            .replace("template", "");
        const writeFileName = `subscribe${templateSuffix}.yml`;
        fs.writeFileSync(
            path.join(ROOT_PATH, writeFileName),
            yaml.stringify(parsedYaml),
            "utf-8"
        );
        log("success", "🎊 subscribe.yml 生成成功!");
        // upload to gist
        if (process.env.NODE_ENV === "production") {
            try {
                const gistUrl = await uploadFileToGist(
                    writeFileName,
                    fs.readFileSync(
                        path.join(ROOT_PATH, writeFileName),
                        "utf-8"
                    )
                );
                subUrls.push(gistUrl);
                log("success", `🎊 Gist 上传成功`);
            } catch (error) {
                log("debug", error);
                log("error", "Gist 上传失败!");
            }
        }
        log("info", `=============== ${fileName} process end ===============`);
    }
    // done
    log("info", "🎉 任务结束");
    subUrls.forEach((url) => {
        log("success", `已生成的订阅地址: ${url}`);
    });
}

main();
