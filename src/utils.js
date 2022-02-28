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

/**
 * Gets the file name from a provided file path.
 * @param {string} filePath the file path to extract a file name from
 * @return {string} returns the file name from a file path; otherwise an empty string
 */
const getFileName = (filePath) => (filePath && filePath.replace(/^.*[\\/]/, '')) || '';

/**
 * The possible Pinata file pin statuses
 */
const PinSatus = {
  ALL: 'all', // Records for both pinned and unpinned content will be returned
  PINNED: 'pinned', // Only records for pinned content will be returned
  UNPINNED: 'unpinned', // Only records for unpinned content will be returned
};

module.exports = {
  getFileName,
  PinSatus,
};
