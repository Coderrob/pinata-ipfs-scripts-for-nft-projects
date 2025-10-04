/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import * as fs from 'fs-extra';
import { read } from 'recursive-fs';

import { IFileService } from '../types';
import { isEmptyArray, Logger } from '../utils';

export class FileService implements IFileService {
  private readonly logger = new Logger('FileService');

  /**
   * Gets all files from a folder (interface method)
   */
  public async getFiles(folderPath: string): Promise<string[]> {
    return this.readFiles(folderPath);
  }

  /**
   * Ensures a directory exists, creating it if necessary (interface method)
   */
  public async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.ensureDir(dirPath);
      this.logger.debug(`Ensured directory exists: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to ensure directory exists: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Writes JSON data to a file (interface method)
   */
  public async writeJsonFile(filePath: string, data: unknown): Promise<void> {
    return this.saveJson(filePath, data);
  }

  /**
   * Reads all files from a given folder recursively
   * @param folderPath - The path to the folder to read
   * @returns Array of file paths
   */
  public async readFiles(folderPath: string): Promise<string[]> {
    try {
      this.logger.info(`Reading files from folder: ${folderPath}`);
      const { files } = await read(folderPath);

      if (!files || isEmptyArray(files)) {
        this.logger.warn(`No files found in folder: ${folderPath}`);
        return [];
      }

      this.logger.info(`Found ${files.length} files in ${folderPath}`);
      return files;
    } catch (error) {
      this.logger.error(`Failed to read files from ${folderPath}`, error);
      throw error;
    }
  }

  /**
   * Saves data as JSON to a file
   * @param filePath - The path where to save the file
   * @param data - The data to save
   */
  public async saveJson(filePath: string, data: unknown): Promise<void> {
    try {
      this.logger.info(`Saving JSON to: ${filePath}`);
      fs.outputJsonSync(filePath, data);
      this.logger.info(`Successfully saved JSON to: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to save JSON to ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Reads JSON data from a file
   * @param filePath - The path to the JSON file
   * @returns The parsed JSON data
   */
  public async readJson<T>(filePath: string): Promise<T> {
    try {
      this.logger.info(`Reading JSON from: ${filePath}`);
      const data = fs.readJsonSync(filePath);
      this.logger.info(`Successfully read JSON from: ${filePath}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to read JSON from ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Reads file content synchronously
   * @param filePath - The path to the file
   * @returns The file content as Buffer
   */
  public readFileSync(filePath: string): Buffer {
    try {
      return fs.readFileSync(filePath);
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Checks if a file exists by attempting to read it
   * @param filePath - The path to check
   * @returns True if file exists and is readable
   */
  public fileExists(filePath: string): boolean {
    try {
      fs.readFileSync(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
