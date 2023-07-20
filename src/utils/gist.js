import { Octokit } from "@octokit/rest";
import { getGistConfig } from "./configGetter.js";
import { log } from "./log.js";

export async function uploadFileToGist(fileContent) {
    // 读取配置
    const gistConfig = getGistConfig();
    const commonConfig = gistConfig.common[0];
    const ghToken = process.env.GH_TOKEN || commonConfig.token;
    const gistId = process.env.GIST_ID || commonConfig.id;
    const filename =
        process.env.GIST_FILENAME || commonConfig.filename || "clash-sub.yaml";
    // 上传文件
    const octokit = new Octokit({ auth: ghToken });
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
    log("success", `🎊 Gist upload successful: ${gistUrl}`);
}
