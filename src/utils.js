const MAX_PAGE_LIMIT = 1000;

const getFileName = (file) => {
  return file.replace(/^.*[\\\/]/, "");
};

const FileStatus = {
  ALL: "all", // (Records for both pinned and unpinned content will be returned)
  PINNED: "pinned", // (Only records for pinned content will be returned)
  UNPINNED: "unpinned", // (Only records for unpinned content will be returned)
};

module.exports = {
  MAX_PAGE_LIMIT,
  FileStatus,
  getFileName,
};
