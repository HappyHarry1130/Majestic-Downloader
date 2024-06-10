# AWR Cloud Data to BigQuery Automation

This project automates the process of fetching data from the Majestic Cloud API, converting the data into a suitable format, and uploading it to Google BigQuery. The process will be automated to run daily via a crontab job.

## Project Structure

Below is the project file structure detailing the main components:





## Configuration

Configuration for this project is managed via the `config.json` file, which includes:

- **`credentialsPath`**: Path to the Google Cloud service account credentials.
- **`apikey`**: API key for accessing the Majestic Cloud API.
- **`bigQuery`**:
  - **`DatasetID`**: Specifies the BigQuery dataset to use.
  - **`TableID`**: Specifies the BigQuery table to store the data.
- **`projects`**: List of project names to fetch data for.

Example of `config.json`:
```json
{
    "apikey": "<Your-API-Key>",
    "bigQuery": {
        "DatasetID": "123inkjets",
        "TableID": "majestic"
    },
    "projects": [
    ]
}
```

### Download the source code from Git 
The Majestic downloader is installed in the necessary directory of the VM.  Follow these instructions to install the systme:

- Move to the appropriate directory using the `cd ` command.
- Download the code from Github using the command `git clone git@github.com:statbid/majestic_downloader.git`. You must be authenticated
to Github on the VM before issuing this command. The repository will create a directory called `awr_downloader` containing the source code and related assets.

### Installing necessary NPMs and building the system
- From the right directory on the VM, issue the `npm install` command.  This will download all of the necessary NPM libraries
and place them in the `node_modules` directory.
- Once the library installation process is complete, use the `npm run build` command to build the system.  This will create
JavaScript files in the `dist` directory.
- Move up one directory level using the `cd ..` command.
- Use the `sudo chown -R downloader1:downloaders awr_downloader` command to change ownership of the code and assets.
- Use the `sudo chmod u+x ./majestic_downloader/runAWRDownload.sh` command to make the `runAWRDownload.sh` script executable.

## Running the downloader
You can use the `runMajesticDownload.sh` shell script to run the downloader.  The shell script will invoke the AWR downloader to retrieve

The downloader must be run using the `downloader1` account on the VM.  To become the `downloader1` user and run the system, enter the following
commands:

```shell
sudo su - downloader1
```
(The prompt will change to a `$` character.)
```shell
cd ./majestic_downloader
./runMajesticDownload.sh
exit
```
When the `exit` comand is run you will return to your normal login account.

In addition to the downloaded statistics, a log file is created that contains the output of the various commands run in 
the `runMajesticDownload.sh` script.  This log file is copied to GCS with the data files, and is very valuable for analyzing any failures that may occur.



## Define the crontab entry to periodically execute the script
In order for the script to execute periodically, a crontab entry must be created.

- Use the `sudo su - downloader1` command to become the `downloader1` user.  This is required to enable customization of the `downloader1` crontab.
- Use the command `crontab -e` to enter edit mode on the crontab.  Make the necessary changes, then save and exit.
- Return to your normal user context by entering the `exit` command.

A crontab entry defines two pieces of information: when a task is to run, and what task is to run.  A sample entry may look like this:

```shell
0 20 * * * /path/to/script >/dev/null 2>&1
```

NOTE: The `crontab -e` command invokes the 'nano' editor to allow you to change the crontab.  It's recommend that you become at least minimally familiar with 'nano' before editing the crontab.

The numbers at the beginning of the crontab entry define *when* the utility is to run. [Crontab Guru](https://crontab.guru/) is an excellent resource for more information on how these values are used.
The `/path/to/script` portion defines which script is to be run at the designated time.  In the case of the GSC downloader this will be `/downloads/gsc_downloader/runGscDownload.sh`.
The last portion (` >/dev/null 2>&1`) should be added at the end.

## Running the script manually
To run the script manually, follow these steps:

- Use the `sudo su - downloader1` command to become the `downloader1` user.  This is required to enable customization of the `downloader1` crontab.
- Use the command `cd ` to move into the downloader's directory.
- Use the command `./runMajesticDownload.sh` to execute the downloader.
- Return to your normal user context by entering the `exit` command.


