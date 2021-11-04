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
const { FileStatus, MAX_PAGE_LIMIT } = require("./utils.js");
const fs = require("fs-extra");
const pinataSDK = require("@pinata/sdk");

(async () => {
  const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

  /**
   * Get a page of results from Pinata of all pinned files mapped with IPFS CIDs.
   *
   * @param {number} pageOffset the page index of the results to return. Defaults to 0.
   * @param {number} pageLimit the limit to number of results to return. Maximum is 1000. Default is 5.
   * @return {object} returns an object containing file name mapped to its IPFS hash.
   *
   */
  const getFileCIDMappings = async (pageOffset, pageLimit) => {
    const filter = {
      status: FileStatus.PINNED,
      pageLimit,
      pageOffset,
    };
    const { count: totalCount, rows } = (await pinata.pinList(filter)) || {};
    const pageCount = rows?.length ?? 0;
    if (totalCount === 0 || pageCount <= 0) {
      return {};
    }
    // Convert array to '[fileName]: CID' property mappings
    return rows.reduce((mappings, row) => {
      const {
        ipfs_pin_hash: cid,
        metadata: { name: fileName },
      } = row;
      return {
        ...mappings,
        ...{ [fileName]: cid },
      };
    }, {});
  };

  try {
    const outputPath = "./output/downloaded-cids.json";
    let pageOffset = 0;
    let cidMapping = {};
    let hasMappings = true;
    while (hasMappings) {
      const fileMapping = await getFileCIDMappings(pageOffset, MAX_PAGE_LIMIT);
      cidMapping = { ...fileMapping };
      pageOffset += 1;
      hasMappings = fileMapping?.length > 0;
    }
    if (Object.keys(cidMapping).length <= 0) {
      console.info("No pinned files were found.");
      return;
    }
    fs.outputJsonSync(outputPath, cidMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
