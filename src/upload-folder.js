/*
MIT License

Copyright (c) 2021 Rob (Coderrob) Lindley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

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
