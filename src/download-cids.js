require("dotenv").config();
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const { FileStatus, MAX_PAGE_LIMIT } = require("./utils.js");
const fs = require("fs-extra");
const pinataSDK = require("@pinata/sdk");

(async () => {
  const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

  const getFileMappings = async (pageOffset, pageLimit) => {
    const filter = {
      status: FileStatus.PINNED,
      pageLimit,
      pageOffset,
    };
    const { count, rows } = (await pinata.pinList(filter)) || {};
    const rowCount = rows?.length ?? 0;
    if (count === 0 || rowCount <= 0) {
      return {};
    }
    return rows.reduce((map, row) => {
      const {
        ipfs_pin_hash: ipfsHash,
        metadata: { name },
      } = row;
      return { ...map, ...{ [name]: ipfsHash } };
    }, {});
  };

  try {
    const outputPath = "./cid-mapping.json";
    let pageOffset = 0;
    let cidMapping = {};
    let hasMappings = true;
    while (hasMappings) {
      const fileMapping = await getFileMappings(pageOffset, MAX_PAGE_LIMIT);
      cidMapping = { ...fileMapping };
      pageOffset += 1;
      hasMappings = fileMapping?.length > 0;
    }
    fs.outputJsonSync(outputPath, cidMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
