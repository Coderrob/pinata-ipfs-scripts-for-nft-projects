/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command, Option } from 'commander';

import { OptionGroups } from './options';

/**
 * Utility class for building commands with common patterns
 */
export class CommandBuilder {
  private command: Command;

  constructor(name: string, description: string) {
    this.command = new Command(name).description(description);
  }

  /**
   * Add a predefined group of options
   */
  addOptionGroup(group: Option[]): this {
    group.forEach(option => this.command.addOption(option));
    return this;
  }

  /**
   * Add file processing options (folder + output)
   */
  addFileProcessingOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.fileProcessing(outputDefault));
  }

  /**
   * Add batch processing options (folder + output + concurrency)
   */
  addBatchProcessingOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.batchProcessing(outputDefault));
  }

  /**
   * Add upload files options (folder + output + concurrency + rate limiting)
   */
  addUploadFilesOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.uploadFiles(outputDefault));
  }

  /**
   * Add upload folder options (metadata folder + output + name)
   */
  addUploadFolderOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.uploadFolder(outputDefault));
  }

  /**
   * Add hash calculation options (includes final output for hash of hashes)
   */
  addHashCalculationOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.hashCalculation(outputDefault));
  }

  /**
   * Add download options (output + status filter)
   */
  addDownloadOptions(outputDefault?: string): this {
    return this.addOptionGroup(OptionGroups.download(outputDefault));
  }

  /**
   * Add custom option
   */
  addOption(option: Option): this {
    this.command.addOption(option);
    return this;
  }

  /**
   * Add action handler
   */
  setAction(handler: (...args: unknown[]) => void | Promise<void>): this {
    this.command.action(handler);
    return this;
  }

  /**
   * Build and return the command
   */
  build(): Command {
    return this.command;
  }
}
