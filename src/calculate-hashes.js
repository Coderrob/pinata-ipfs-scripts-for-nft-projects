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

import { readFileSync, outputJsonSync } from 'fs-extra';
import Bottleneck from 'bottleneck';
import { createHash } from 'crypto';
import { read } from 'recursive-fs';
import { getFileName } from './utils';

const { log, error } = console;

(async () => {
  const rateLimiter = new Bottleneck({
    maxConcurrent: 5, // arbitrary value - don't overdue file access
  });

  try {
    const outputPath = './output/file-hashes.json';
    const folderPath = 'files';
    const hashMapping = {};
    const { files } = await read(folderPath);
    if (files?.length <= 0) {
      log(`No files were found in folder '${folderPath}'`);
      return;
    }
    await Promise.all(
      files.map((filePath) => rateLimiter.schedule(() => {
        const fileName = getFileName(filePath);
        log(`${fileName} hash started`);
        const fileData = readFileSync(filePath);
        const fileHash = createHash('sha256')
          .update(fileData)
          .digest('hex');
        log(`${fileName} sha256: ${fileHash}`);
        hashMapping[fileName] = fileHash;
      })),
    );
    outputJsonSync(outputPath, hashMapping);
  } catch (err) {
    error(err);
    process.exit(1);
  }
})();
