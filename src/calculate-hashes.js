const { getFileName } = require("./utils.js");
const fs = require("fs-extra");
const Bottleneck = require("bottleneck");
const crypto = require("crypto");
const recursive = require("recursive-fs");

(async () => {
  const rateLimiter = new Bottleneck({
    maxConcurrent: 5, // arbitrary value - don't overdue file access
  });

  try {
    const outputPath = "./output/file-hashes.json";
    const folderPath = "files";
    const hashMapping = {};
    const { files } = await recursive.read(folderPath);
    if (files?.length <= 0) {
      console.info("No files were found in folder path.");
      return;
    }
    await Promise.all(
      files.map((filePath) =>
        rateLimiter.schedule(() => {
          const fileName = getFileName(filePath);
          const fileData = fs.readFileSync(filePath);
          hashMapping[fileName] = crypto
            .createHash("sha256")
            .update(fileData)
            .digest("hex");
        })
      )
    );
    fs.outputJsonSync(outputPath, hashMapping);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
