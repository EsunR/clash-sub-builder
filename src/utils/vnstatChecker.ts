/**
 * name: vnstat 监控
 * cron: 30,59 * * * *
 */
import axios from "npm:axios";
import { log } from "./log.ts";
import { transBit2Gb, transGb2Bit } from "./index.ts";
import { getVnstatConfig } from "./configGetter.ts";

/**
 * ============= types =============
 */
export interface VnstatConfigItem {
    url: string;
    name: string;
    hostName: string;
    total: number;
}

interface TrafficValue<D> {
    date: D;
    id: number;
    rx: number;
    tx: number;
}

interface VnstatDate {
    day: number;
    month: number;
    year: number;
}

interface VnstatTime {
    hour: number;
    minute: number;
}

interface TrafficValueDay extends TrafficValue<VnstatDate> {}

interface TrafficValueMonth extends TrafficValue<Omit<VnstatDate, "year">> {}

interface TrafficValueYear extends TrafficValue<Pick<VnstatDate, "year">> {}

interface TrafficValueTime extends TrafficValue<VnstatDate> {
    time: VnstatTime;
}

interface VnstatInterface {
    alias: string;
    created: {
        date: VnstatDate;
    };
    name: string;
    traffic: {
        day: TrafficValueDay[];
        fiveminute: TrafficValueTime[];
        hour: TrafficValueTime[];
        month: TrafficValueMonth[];
        top: TrafficValueDay[];
        year: TrafficValueYear[];
        total: {
            rx: number;
            tx: number;
        };
    };
    updated: {
        date: VnstatDate;
        time: VnstatTime;
    };
}

interface VnstatJson {
    interfaces: VnstatInterface[];
}

interface VnstatInfoItem {
    hostName: string;
    /**
     * 上传流量，单位为 bit
     */
    upload: number;
    /**
     * 下载流量，单位为 bit
     */
    download: number;
    /**
     * 总流量，单位为 bit
     */
    total: number;
}

async function getVnstatJsonData(url: string) {
    return (
        await axios.request({
            method: "get",
            url,
            proxy: false,
        })
    ).data as VnstatJson;
}

let cachedVnstatInfo: VnstatInfoItem[] = [];

export async function getVnstatInfo(vnstatConfig: VnstatConfigItem[]) {
    if (cachedVnstatInfo.length) {
        return cachedVnstatInfo;
    }
    const results: VnstatInfoItem[] = [];

    const promiseResult = await Promise.allSettled(
        vnstatConfig
            .filter((config) => config.name && config.url)
            .map(async (config) => {
                const res = await getVnstatJsonData(config.url);
                const vnstatResult = res.interfaces.find(
                    (item) => item.name === config.name
                );
                if (!vnstatResult) {
                    return;
                }
                const currentHourData = vnstatResult.traffic.hour.pop();
                const currentDayData = vnstatResult.traffic.day.pop();
                const currentMonthData = vnstatResult.traffic.month.pop();
                if (!(currentHourData && currentDayData && currentMonthData)) {
                    return;
                }
                results.push({
                    hostName: config.hostName,
                    download: currentMonthData.rx,
                    upload: currentMonthData.tx,
                    total: transGb2Bit(config.total),
                });
            })
    );

    promiseResult.forEach((item) => {
        if (item.status === "rejected") {
            console.log(item.reason);
            log(
                "error",
                `获取 vnstat 数据失败: ${item.reason.message || item.reason}`
            );
        }
    });

    cachedVnstatInfo = results;

    return results;
}

/**
 * 创建流量检查的分组
 */
export async function createVnstatCheckerGroups(): Promise<ProxyGroupItem[]> {
    const result: ProxyGroupItem[] = [];
    const vnstatConfig = getVnstatConfig();
    log("info", "正在获取当前 vnstat 流量数据...");
    const vnstatInfo = await getVnstatInfo(vnstatConfig);
    log("success", `获取到 ${vnstatInfo.length} 个 vnstat 数据`);
    vnstatInfo.forEach((item) => {
        result.push({
            name: `${item.hostName} 用量: ${parseInt(
                `${transBit2Gb(item.download + item.upload)}`
            )}G/${transBit2Gb(item.total)}G`,
            type: "select",
            rule: ["DIRECT"],
        });
    });
    return result;
}

export async function getVnstatSubscribeUserInfoHeader() {
    const vnstatConfig = getVnstatConfig();
    const vnstatInfo = await getVnstatInfo(vnstatConfig);
    const upload = vnstatInfo.reduce((acc, item) => acc + item.upload, 0);
    const download = vnstatInfo.reduce((acc, item) => acc + item.download, 0);
    const total = vnstatInfo.reduce((acc, item) => acc + item.total, 0);
    return `upload=${upload}; download=${download}; total=${total}`;
}
