const { getFileName } = require("./utils.js");
const fs = require("fs-extra");
const Bottleneck = require("bottleneck");
const Hash = require("ipfs-only-hash");
const recursive = require("recursive-fs");

(async () => {
  const rateLimiter = new Bottleneck({
    maxConcurrent: 5, // arbitrary value - don't overdue file access
  });

  try {
    const outputPath = "./output/file-cids.json";
    const folderPath = "files";
    const cidMapping = {};
    const { files } = await recursive.read(folderPath);
    if (files?.length <= 0) {
      console.info("No files were found in folder path.");
      return;
    }
    await Promise.all(
      files.map((filePath) =>
        rateLimiter.schedule(async () => {
          const fileName = getFileName(filePath);
          const fileData = fs.readFileSync(filePath);
          cidMapping[fileName] = await Hash.of(fileData);
        })
      )
    );
    fs.outputJsonSync(outputPath, cidMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
