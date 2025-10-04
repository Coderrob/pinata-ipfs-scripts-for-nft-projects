/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command, Option } from 'commander';

import { DefaultOutputs, OptionGroups } from './options';

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
  addFileProcessingOptions(): this {
    return this.addOptionGroup(OptionGroups.fileProcessing);
  }

  /**
   * Add batch processing options (folder + output + concurrency)
   */
  addBatchProcessingOptions(): this {
    return this.addOptionGroup(OptionGroups.batchProcessing);
  }

  /**
   * Add upload files options (folder + output + concurrency + rate limiting)
   */
  addUploadFilesOptions(): this {
    return this.addOptionGroup(OptionGroups.uploadFiles);
  }

  /**
   * Add upload folder options (metadata folder + output + name)
   */
  addUploadFolderOptions(): this {
    return this.addOptionGroup(OptionGroups.uploadFolder);
  }

  /**
   * Add hash calculation options (includes final output for hash of hashes)
   */
  addHashCalculationOptions(): this {
    return this.addOptionGroup(OptionGroups.hashCalculation);
  }

  /**
   * Add download options (output + status filter)
   */
  addDownloadOptions(): this {
    return this.addOptionGroup(OptionGroups.download);
  }

  /**
   * Set a default output path
   */
  setDefaultOutput(outputType: keyof typeof DefaultOutputs): this {
    const defaultPath = DefaultOutputs[outputType];
    this.command.option('-o, --output <path>', 'Output path for results', defaultPath);
    return this;
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
