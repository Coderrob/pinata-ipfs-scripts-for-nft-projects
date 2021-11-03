require("dotenv").config();
const { getFileName } = require("./utils.js");
const crypto = require("crypto");
const fs = require("fs-extra");
const Bottleneck = require("bottleneck");
const recursive = require("recursive-fs");

(async () => {
  const limiter = new Bottleneck({
    maxConcurrent: 5,
  });

  try {
    const outputPath = "./file-hashes.json";
    const folderPath = "files";
    const hashMapping = {};
    const { files } = await recursive.read(folderPath);
    if (files?.length > 0) {
      await Promise.all(
        files.map((path) =>
          limiter.schedule(() => {
            const name = getFileName(path);
            const data = fs.readFileSync(path);
            hashMapping[name] = crypto
              .createHash("sha256")
              .update(data)
              .digest("hex");
          })
        )
      );
    }
    fs.outputJsonSync(outputPath, hashMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
