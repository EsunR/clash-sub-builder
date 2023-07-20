import fs from "fs";
import path from "path";
import yaml from "yaml";
import { ROOT_PATH } from "./constance.js";
import {
    getClashTemplate,
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

async function main() {
    const groups = getGroups();
    const rulesets = getRulesets();
    const template = getClashTemplate();
    // set proxies name
    template["proxies"] = generateProxies(template.proxies);
    // set proxy groups
    const proxyGroups = generateProxyGroups(template.proxies, groups);
    template["proxy-groups"] = proxyGroups;
    // set rules
    const rules = generateRules(rulesets, groups);
    template["rules"] = rules;
    // write to file
    fs.writeFileSync(
        path.join(ROOT_PATH, "./subscribe.yml"),
        yaml.stringify(template),
        "utf-8"
    );
    log("success", "🎊 Generate subscribe.yml successfully!");
    // upload to gist
    if (process.env.NODE_ENV === "production") {
        try {
            await uploadFileToGist(
                fs.readFileSync(
                    path.join(ROOT_PATH, "./subscribe.yml"),
                    "utf-8"
                )
            );
        } catch (error) {
            log("debug", error);
            log("error", "Gist upload failed!");
        }
    }
    // done
    log("success", "🎉 All done!");
}

main();
