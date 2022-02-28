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

const { readFileSync, outputJsonSync } = require('fs-extra');
const Bottleneck = require('bottleneck');
const { of } = require('ipfs-only-hash');
const { read } = require('recursive-fs');
const { getFileName } = require('./utils');

const { log, error } = console;

(async () => {
  const rateLimiter = new Bottleneck({
    maxConcurrent: 5, // arbitrary value - don't overdue file access
  });

  try {
    const OUTPUT_PATH = './output/file-cids.json';
    const FOLDER_PATH = 'files';
    const cidMapping = {};
    const { files } = await read(FOLDER_PATH);
    if ((files && files.length) <= 0) {
      log(`No files were found in folder '${FOLDER_PATH}'`);
      return;
    }
    await Promise.all(
      files.map((filePath) => rateLimiter.schedule(async () => {
        const fileName = getFileName(filePath);
        log(`${fileName} hashing started`);
        const fileData = readFileSync(filePath);
        const fileHash = await of(fileData);
        log(`${fileName} CID: ${fileHash}`);
        cidMapping[fileName] = fileHash;
      })),
    );
    outputJsonSync(OUTPUT_PATH, cidMapping);
  } catch (err) {
    error(err);
    process.exit(1);
  }
})();
