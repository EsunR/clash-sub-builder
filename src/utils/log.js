import chalk from "chalk";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export function log(logType, message, ...rest) {
    let prefix = "";
    switch (logType) {
        case "warn":
            prefix = chalk.black.bgYellow("WARN");
            break;
        case "error":
            prefix = chalk.white.bgRed("ERROR");
            break;
        case "success":
            prefix = chalk.black.bgGreen("SUCCESS");
            break;
        case "info":
            prefix = chalk.black.bgBlue("INFO");
            break;
        case "debug":
        default:
            prefix = chalk.black.bgWhite("DEBUG");
            break;
    }
    console.log(
        `[${dayjs().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}]`,
        prefix,
        message,
        ...rest
    );
}
