require("dotenv").config();
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const { getFileName } = require("./utils.js");
const fs = require("fs-extra");
const recursive = require("recursive-fs");
const Bottleneck = require("bottleneck");
const pinataSDK = require("@pinata/sdk");

(async () => {
  const pinataCIDs = fs.readJsonSync("./pinata-cids.json") ?? {};
  const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 3000, // 3 seconds
  });

  const cidExists = (name) => {
    return {
      exists: !!pinataCIDs[name],
      ipfsHash: pinataCIDs[name],
    };
  };

  const uploadFile = async (name, path) => {
    const { exists, ipfsHash } = cidExists(name);
    if (exists) {
      return ipfsHash;
    }
    const { IpfsHash } = await pinata.pinFileToIPFS(fs.createReadStream(path), {
      pinataMetadata: {
        name,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    });
    return IpfsHash;
  };

  try {
    const outputPath = "./result.json";
    const folderPath = "files";
    const cidMapping = {};
    const { files } = await recursive.read(folderPath);
    if (files?.length > 0) {
      await Promise.all(
        files.map(async (path) => {
          const name = getFileName(path);
          cidMapping[name] = await limiter.schedule(() =>
            uploadFile(name, path)
          );
        })
      );
    }
    fs.outputJsonSync(outputPath, cidMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
