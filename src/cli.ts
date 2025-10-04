#!/usr/bin/env node

/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 *
 * Pinata IPFS CLI - A TypeScript-based command-line interface for NFT operations with Pinata
 */

import 'dotenv/config';

import { Command, CommanderError } from 'commander';

import { CIDCommand, DownloadCommand, HashCommand, UploadFilesCommand, UploadFolderCommand } from './commands';

class PinataCLI {
  private readonly program: Command;
  private readonly commands: Array<{ configure: (cmd: Command) => void }>;

  constructor() {
    this.program = new Command();
    this.commands = [
      new HashCommand(),
      new CIDCommand(),
      new UploadFilesCommand(),
      new UploadFolderCommand(),
      new DownloadCommand(),
    ];
  }

  public init(): void {
    this.configureProgram();
    this.registerCommands();
    this.addGlobalOptions();
    this.handleErrors();
  }

  public run(): void {
    this.program.parse();
  }

  private configureProgram(): void {
    this.program
      .name('pinata-cli')
      .version('2.0.0')
      .description('CLI tool for managing NFT files and metadata with Pinata IPFS')
      .configureHelp({
        sortSubcommands: true,
        subcommandTerm: (cmd: Command) => cmd.name(),
      });
  }

  private registerCommands(): void {
    this.commands.forEach(command => {
      command.configure(this.program);
    });
  }

  private addGlobalOptions(): void {
    this.program
      .option('--verbose', 'Enable verbose logging')
      .option('--dry-run', 'Show what would be done without executing')
      .hook('preAction', (cmd: Command) => {
        const opts = cmd.opts();
        if (opts.verbose) {
          process.env.NODE_ENV = 'development';
        }
        if (opts.dryRun) {
          console.log('🔍 Dry run mode enabled - no operations will be executed');
        }
      });
  }

  private handleErrors(): void {
    this.program.exitOverride(err => {
      // Handle Commander.js specific errors gracefully
      if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
        // Help was displayed, exit normally
        process.exit(0);
      } else if (err.code === 'commander.version') {
        // Version was displayed, exit normally
        process.exit(0);
      } else if (err.code === 'commander.unknownCommand' || err.code === 'commander.invalidArgument') {
        // Command errors - let Commander.js handle the message display, just exit cleanly
        process.exit(err.exitCode || 1);
      } else {
        // Other commander errors
        throw err;
      }
    });

    process.on('uncaughtException', error => {
      // Only log actual errors, not Commander.js normal operations
      if (error.name === 'CommanderError') {
        const commanderError = error as CommanderError;
        if (
          commanderError.code === 'commander.help' ||
          commanderError.code === 'commander.helpDisplayed' ||
          commanderError.code === 'commander.version'
        ) {
          // These are normal operations, exit gracefully
          process.exit(commanderError.exitCode || 0);
        } else if (
          commanderError.code === 'commander.unknownCommand' ||
          commanderError.code === 'commander.invalidArgument'
        ) {
          // Command errors - show message and exit with error code
          console.error(commanderError.message);
          process.exit(commanderError.exitCode || 1);
        }
      }

      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', reason => {
      console.error('💥 Unhandled Rejection:', reason);
      process.exit(1);
    });
  }
}

// Main execution
if (require.main === module) {
  const cli = new PinataCLI();
  cli.init();
  cli.run();
}

export { PinataCLI };
