import { ConfigHelper } from "./helpers/ConfigHelper";
import { MajesticDownloader } from "./MajasticDownloader";

async function main() {
    try {
        const configHelper = new ConfigHelper();
        const config = await configHelper.getConfig();

        if (config) {
            const majasticDownloader = new MajesticDownloader();
            const result = await majasticDownloader.execute(config);
        }
    }
    catch (err) {
        process.stderr.write(err + '\n');
    }
    finally {
        process.stderr.write('Done.\n');
    }
}

main();