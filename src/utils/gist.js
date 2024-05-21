import { Octokit } from "@octokit/rest";
import { getGistConfig } from "./configGetter.js";
import { log } from "./log.js";

const gistConfig = getGistConfig();
const token = gistConfig.token;
const gistId = gistConfig.id;
const filename = gistConfig.filename || "clash-sub.yaml";

const octokit = new Octokit({ auth: token });

export async function uploadFileToGist(fileContent) {
    // 上传文件
    // 判断文件是否存在
    const res = await octokit.rest.gists.update({
        gist_id: gistId,
        description:
            "clash subscribe (created by node EsunR/clash-sub-builder)",
        files: {
            [filename]: {
                content: fileContent,
            },
        },
    });
    // 拼接 url
    const gistUrl = `${
        res.data.files[filename].raw_url.split("/raw")[0]
    }/raw/${filename}`;
    log("success", `🎊 Gist 上传成功，订阅地址: ${gistUrl}`);
}

export async function getTemplateFromGist() {
    // 下载模板
    const res = await octokit.rest.gists.get({
        gist_id: gistId,
    });
    const files = res.data.files;
    if (files["template.yml"]) {
        const template = files["template.yml"].content;
        log("info", "检测到 Gist 中存在模板，优先使用选择使用");
        return template;
    }
}
