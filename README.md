# Pinata IPFS scripts for NFT projects

<a href="https://www.buymeacoffee.com/coderrob" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-white.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## Scripts

The scripts contained in this repository were created to help automate the import and processing of NFT profile pic projects. Each script serves a unique purpose and when combined will help import both NFT images and the associated image metadata. A brief description of the scripts is below:

- `calculate-cids.js` - calculate the IPFS hash CID for every file in a specified folder
- `calculate-hashes.js` - calculate the sha256 hash for every file in a specified folder
- `download-cids.js` - downloads every pinned file from Pinata for an API account
- `upload-files.js` - uploads the condents of a specified folder and pins each individual file in Pinata
- `upload-folder.js` - uploads the contents of a specified folder and pins the folder container and its contents

### Getting Started

Clone the repository.

```bash
>_ git clone https://github.com/Coderrob/nft-pinata-bulk-upload.git
```

Change directory to the `nft-pinata-bulk-upload` folder.

```bash
>_ cd nft-pinata-bulk-upload
```

Install dependencies.

```bash
>_ npm install
```

Some scripts require environment variables to connect with the [Pinata API](https://docs.pinata.cloud/). These environment variales are needed to download pinned files, or to upload files and folders.

#### Environment Variables

`PINATA_API_KEY` - The Pinata API Key environment variable

`PINATA_API_SECRET` - The Pinata API Secret environment variable

The repo is setup with [dotenv](https://github.com/motdotla/dotenv) and configured to allow using an `.env` file to run the scripts.

If the env file does not already exist simply create a new `.env` file at the root of the repository.

The contents of the `.env` file should look similar to this:

```ini
PINATA_API_KEY="a1237a8dcd87766ff4"
PINATA_API_SECRET="fb8654309ca8777asdf7558758123456asdf817166927aknnk888877"
```

To generate these Pinata API keys you'll need to follow the [Getting Started](https://docs.pinata.cloud/#your-api-keys) Pinata documentation

### Calculate File IPFS CIDs

`/src/calculate-cids.js`

The calculate file CIDs script will iterate the contents of a specified folder, and for each file will compute the IPFS hash CID mapped to the file name.

Once complete the script will output the file name and CID mappings to a file.

#### Settings

`var: outputPath` - The relative output file path. Defaulted to `./output/file-cids.json`.

`var: folderPath` - The relative folder path containing the files to be processed. Each file will have its name and CID mapped. Defaulted to the `files` folder.

#### Command

```bash
node ./src/calculate-cids.js
```

#### Output

`./output/file-cids.json`

#### Contents

```json
{
  "one.png": "QmZPnX4481toHABEtvKFoCWoVuzFFQRBiA5QR2Cij9pjon",
  "two.png": "QmazpAaWf3Bb4qhSW9PnQXfj2URbQwdNbZvDr77RbwH7xb"
}
```

### Calculate File sha256 Hashes

`/src/calculate-hashes.js`

The calculate file hashes script will iterate the contents of a specified folder, and for each file will compute the sha256 hash mapped to the file name.

Once complete the script will output the file name and sha256 hash mappings to a file.

#### Settings

`var: outputPath` - The relative output file path. Defaulted to `./output/file-hashes.json`.

`var: folderPath` - The relative folder path containing the files to be processed. Each file will have its name and CIDsha256 hash mapped. Defaulted to the `files` folder.

#### Command

```bash
node ./src/calculate-hashes.js
```

#### Output

`./output/file-hashes.json`

#### Contents

```json
{
  "one.png": "f8e50b5c45e6304b41f87686db539dd52138b873a3af98cc60f623d47a133df2",
  "two.png": "76d9c6f8dc113fff71a180195077526fce3d0279034a37f23860c1f519512e94"
}
```

### Download Pinata Pinned CIDs

`/src/download-cids.js`

The download file CIDs script will iterate all pinned files associated with the Pinata API Key. The script will map each row's file name and IPFS hash CID.

Once complete the script will output the file name and CID mappings to a file.

#### Settings

`var: outputPath` - The relative output file path. Defaulted to `./output/downloaded-cids.json`

`env: PINATA_API_KEY` - The Pinata API Key environment value

`evn: PINATA_API_SECRET` - The Pinata API Secret environment value

#### Command

```bash
node ./src/download-cids.js
```

#### Output

`./output/downloaded-cids.json`

#### Contents

```json
{
  "one.png": "QmZPnX4481toHABEtvKFoCWoVuzFFQRBiA5QR2Cij9pjon",
  "two.png": "QmazpAaWf3Bb4qhSW9PnQXfj2URbQwdNbZvDr77RbwH7xb"
}
```

### Upload Files

`/src/upload-files.js`

The upload files script will iterate the contents of a specified folder, and will upload and pin each _individual_ file to Pinata. After a successful upload the file name will be mapped to the IPFS hash CID from the response.

Once complete the script will output the file name and CID mappings to a file.

#### Settings

`var: pinataCIDs` - To prevent re-uploading already pinned files in Pinata. This variable is loaded with the json contents of the `./ouput/downloaded-cids.json` file if one exists. These CID mappings will help prevent re-uploading a file that has already been pinned in Pinata.

`var: outputPath` - The relative output file path. Defaulted to `./output/uploaded-cids.json`.

`var: folderPath` - The relative folder path to read and upload all local files to be pinned with Pinata.  Defaulted to the `files` folder.

`env: PINATA_API_KEY` - The Pinata API Key environment value

`env: PINATA_API_SECRET` - The Pinata API Secret environment value

#### Command

```bash
node ./src/upload-files.js
```

#### Output

`./output/uploaded-cids.json`

#### Contents

```json
{
  "one.png": "QmZPnX4481toHABEtvKFoCWoVuzFFQRBiA5QR2Cij9pjon",
  "two.png": "QmazpAaWf3Bb4qhSW9PnQXfj2URbQwdNbZvDr77RbwH7xb"
}
```

### Upload Folder

`/src/upload-folder.js`

The upload folder script will iterate the contents of a specified folder, and will upload and pin each file under a folder container in Pinata. After a successful upload the folder name will be mapped to the IPFS hash CID from the response.

Once complete the script will output the folder name and CID mapping to a file.

> **Note** - To support `ipfs/<CID>/<TokenId>` such as `ipfs/QmR5m9zJDSmrLnYMawrySYu3wLgN5afo3yizevAaimjvmD/0` simple name the JSON files numerically and strip the file extensions. This will allow the files to be accessed by file name that can be mapped to the `TokenId`.

![Pinata pinned file list](https://github.com/Coderrob/nft-pinata-bulk-upload/blob/master/img/pinned-list.PNG)

![metadata folder container list](https://github.com/Coderrob/nft-pinata-bulk-upload/blob/master/img/metadata-list.PNG)

![File 0 metadata json](https://github.com/Coderrob/nft-pinata-bulk-upload/blob/master/img/metadata-0.PNG)

#### Settings

`var: outputPath` - The relative output file path. Defaulted to `./output/folder-cid.json`.

`var: folderName` - The folder name to use for the uploaded folder of json metadata. This can be changed to any name you'd like that identifies the collection of metadata files.  Defaulted to `metadata` as the folder name.

`var: folderPath` - The relative folder path to read and upload all local files to be pinned in Pinata as a folder container for the uploaded files. Defaulted to the `metadata` folder.

`env: PINATA_API_KEY` - The Pinata API Key environment value

`env: PINATA_API_SECRET` - The Pinata API Secret environment value

#### Command

```bash
node ./src/upload-metadata.js
```

#### Output

`./output/folder-cid.json`

#### Contents

```json
{ 
    "metadata": "QmR5m9zJDSmrLnYMawrySYu3wLgN5afo3yizevAaimjvmD" 
}
```
