require("dotenv").config();
const { getFileName } = require("./utils.js");
const fs = require("fs-extra");
const Bottleneck = require("bottleneck");
const Hash = require("ipfs-only-hash");
const recursive = require("recursive-fs");

(async () => {
  const limiter = new Bottleneck({
    maxConcurrent: 5,
  });

  try {
    const outputPath = "./file-cids.json";
    const folderPath = "files";
    const cidMapping = {};
    const { files } = await recursive.read(folderPath);
    if (files?.length > 0) {
      await Promise.all(
        files.map((path) =>
          limiter.schedule(async () => {
            const name = getFileName(path);
            const data = fs.readFileSync(path);
            cidMapping[name] = await Hash.of(data);
          })
        )
      );
    }
    fs.outputJsonSync(outputPath, cidMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
