/**
 * This class handles downloading data from Majestic.
 */

import fs from 'fs';
import axios from 'axios';
import { stringify } from 'csv-stringify';
import { DownloaderConfig } from "./dto/DownloaderConfig";
import { StatbidMessageLogger } from "./helpers/StatbidMessageLogger";
const moment = require('moment');
interface JsonData {
    [key: string]: any;
}
export class MajesticDownloader {
    private static SERVICE_NAME = 'Majestic-downloader';
    private logger = new StatbidMessageLogger();
    private config = new DownloaderConfig();

    async execute(config: DownloaderConfig) {
        // process.env.GOOGLE_APPLICATION_CREDENTIALS = config.credentialsPath;
        this.config = config;
        const { projects } = config;

        try {
            if (!projects || projects.length == 0) {
                this.logger.logError(
                    MajesticDownloader.SERVICE_NAME,
                    'Majestic downloader',
                    'No any projects'
                );
                return;
            }
            const processingPromises = projects.map(async (projectName: string) => {
                if (projectName) {
                    await this.fetchData(projectName, config);
                }
            });

            await Promise.all(processingPromises);
            this.logger.logInfo(
                MajesticDownloader.SERVICE_NAME,
                'Majestic downloader',
                'Please wait for a while...'
            );

        } catch (error: any) {
            this.logger.logFatal(
                MajesticDownloader.SERVICE_NAME,
                'Majestic downloader',
                `error: ${error.message}`
            )
        }
        finally {
            this.logger.logInfo(
                MajesticDownloader.SERVICE_NAME,
                'Majestic downloader',
                "Download completed"
            )
            // Add any cleanup code here
        }

    }

    private async fetchData(project: string, config: any): Promise<void> {

        const params = {
            app_api_key: config.API_KEY,
            cmd: 'GetBackLinkData',
            item: project,
            Count: config.counts,
            datasource: 'fresh'
        };

        try {

            const response = await axios.get(config.baseUrl, { params });
            if (response.data.Code == 'OK') {
                const jsonData = response.data.DataTables.BackLinks.Data;
                await this.convertToCsv(jsonData, project);
                this.logger.logInfo(
                    MajesticDownloader.SERVICE_NAME,
                    'Majestic downloader',
                    `Converting CSV sucess`
                )
            }
            else {
                this.logger.logWarning(MajesticDownloader.SERVICE_NAME, "Something went wrong", 'please check your input again and then try again');
                return;
            }
        } catch (error: any) {
            this.logger.logFatal(
                MajesticDownloader.SERVICE_NAME,
                'Majestic downloader',
                `error: ${error.message}`
            )
        }
    }

    private async convertToCsv(jsonData: JsonData[], project: string): Promise<void> {
        const date = new Date();
        const formatedDate = this.formatDate(date);

        if (!Array.isArray(jsonData)) {
            console.error('Invalid JSON data');
            return;
        }

        if (jsonData.length === 0) {
            console.error('No data to convert');
            return;
        }

        const fields: string[] = [...Object.keys(jsonData[0])];
        const dataWithProjectID: JsonData[] = jsonData.map((obj: JsonData) => {
            return { ...obj };
        });

        const directoryPath = 'output';
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
        try {
            const csv = await new Promise<string>((resolve, reject) => {
                stringify(dataWithProjectID, { header: true }, (err, output) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(output);
                    }
                });
            });

            fs.writeFile(`${directoryPath}/${project}-${formatedDate}.csv`, csv, function (err) {
                if (err) {
                    console.error('Error writing CSV file:', err);
                } else {
                    console.log('CSV file saved!');
                }
            });
        } catch (error) {
            console.error('Error converting to CSV:', error);
        }
    }
    private formatDate(date: Date): string {
        return moment(date).format('YYYY-MM-DD');
    }

}
