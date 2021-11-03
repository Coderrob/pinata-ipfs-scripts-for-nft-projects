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
    const folderPath = "metadata";
    const { files } = await recursive.read(folderPath);
    if (files?.length <= 0) {
      return;
    }
    const data = new FormData();
    files.forEach((path) => {
      data.append("file", fs.createReadStream(path), {
        filepath: basePathConverter(folderPath, path),
      });
    });
    await axios.post(PINATA_API_PINFILETOIPFS, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
