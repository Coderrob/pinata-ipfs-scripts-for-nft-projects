/*
MIT License

Copyright (c) 2022 Rob (Coderrob) Lindley

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

import { post } from 'axios';
import { createReadStream, outputJsonSync } from 'fs-extra';
import { read } from 'recursive-fs';
import FormData from 'form-data';
import basePathConverter from 'base-path-converter';

require('dotenv').config();

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

const { log, error } = console;

const PINATA_API_PINFILETOIPFS = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

(async () => {
  try {
    const outputPath = './output/folder-cid.json';
    const folderName = 'metadata';
    const folderPath = 'metadata';
    const { files } = await read(folderPath);
    if (files?.length <= 0) {
      log(`No files were found in folder '${folderPath}'`);
      return;
    }
    const formData = new FormData();
    files.forEach((filePath) => {
      log(`Appending file: ${filePath}`);
      formData.append('file', createReadStream(filePath), {
        filepath: basePathConverter(folderPath, filePath),
      });
    });
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: folderName,
      }),
    );
    const {
      data: { IpfsHash: cid },
    } = await post(PINATA_API_PINFILETOIPFS, formData, {
      maxBodyLength: 'Infinity',
      headers: {
        // eslint-disable-next-line no-underscore-dangle
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    outputJsonSync(outputPath, { [folderName]: cid });
  } catch (err) {
    error(err);
    process.exit(1);
  }
})();
