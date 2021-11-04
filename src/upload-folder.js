require("dotenv").config();
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const axios = require("axios");
const fs = require("fs-extra");
const recursive = require("recursive-fs");
const FormData = require("form-data");
const basePathConverter = require("base-path-converter");

const PINATA_API_PINFILETOIPFS =
  "https://api.pinata.cloud/pinning/pinFileToIPFS";

(async () => {
  try {
    const outputPath = "./output/folder-cid.json";
    const folderName = "metadata";
    const folderPath = "metadata";
    const { files } = await recursive.read(folderPath);
    if (files?.length <= 0) {
      console.info("No files were found in folder path.");
      return;
    }
    const formData = new FormData();
    files.forEach((filePath) => {
      formData.append("file", fs.createReadStream(filePath), {
        filepath: basePathConverter(folderPath, filePath),
      });
    });
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: folderName,
      })
    );
    const {
      data: { IpfsHash: cid },
    } = await axios.post(PINATA_API_PINFILETOIPFS, formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    fs.outputJsonSync(outputPath, { [folderName]: cid });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
