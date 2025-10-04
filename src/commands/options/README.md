# Commander.js Reusable Options and Arguments

This directory contains reusable Commander.js options and arguments that are used across multiple commands in the application. The options are organized by functionality and provide a consistent interface for command-line interactions.

## Structure

```
options/
├── path.options.ts        # File system path related options
├── rate-limit.options.ts  # Concurrency and rate limiting options
├── pinata.options.ts      # Pinata-specific options
├── option-groups.ts       # Pre-configured option groups and default values
└── index.ts              # Main exports
```

## Option Categories

### Path Options (`path.options.ts`)

- `folder` - Standard folder path option (default: 'files')
- `output` - Standard output path option
- `metadataFolder` - Metadata-specific folder path (default: 'metadata')
- `finalOutput` - Additional output for hash of hashes

### Rate Limit Options (`rate-limit.options.ts`)

- `concurrent` - Number of concurrent operations (1-10, default: 5)
- `minTime` - Minimum time between operations (default: 3000ms)
- `concurrentUploads` - Specific for file uploads (default: 1)

### Pinata Options (`pinata.options.ts`)

- `name` - Display name for Pinata uploads
- `status` - Pin status filter (all|pinned|unpinned)

### Option Groups (`option-groups.ts`)

Pre-configured groups of options for common command patterns:

- `fileProcessing` - Basic file processing (folder + output)
- `uploadFiles` - File upload functionality (folder + output + concurrency + rate limiting)
- `uploadFolder` - Folder upload functionality (metadata folder + output + name)
- `batchProcessing` - Batch operations (folder + output + concurrency)
- `hashCalculation` - Hash calculations (includes final output option)
- `download` - Download operations (output + status filter)

## Usage Examples

### Basic Usage

```typescript
import { OptionGroups, DefaultOutputs } from './options';

// Add a predefined group of options
const command = program
  .command('example')
  .description('Example command');

OptionGroups.fileProcessing.forEach(option => {
  command.addOption(option);
});

// Set default output
command.option('-o, --output <path>', 'Output path', DefaultOutputs.fileCids);
```

### Using CommandBuilder (Recommended)

```typescript
import { CommandBuilder } from './command-builder';

const command = new CommandBuilder('example', 'Example command description')
  .addBatchProcessingOptions()
  .setDefaultOutput('fileCids')
  .setAction(async (options) => {
    // Handle command execution
  })
  .build();

program.addCommand(command);
```

### Individual Options

```typescript
import { PathOptions, RateLimitOptions } from './options';

program
  .command('custom')
  .addOption(PathOptions.folder)
  .addOption(RateLimitOptions.concurrent)
  .action(async (options) => {
    // Handle command
  });
```

## Benefits

1. **Consistency** - All commands use the same option definitions
2. **DRY Principle** - No duplication of option definitions
3. **Maintainability** - Changes to options are centralized
4. **Type Safety** - Proper TypeScript support for all options
5. **Validation** - Centralized validation logic through option parsers
6. **Documentation** - Self-documenting option descriptions

## Default Output Paths

The `DefaultOutputs` constant provides standardized output paths:

```typescript
export const DefaultOutputs = {
  fileHashes: './output/file-hashes.json',
  fileCids: './output/file-cids.json',
  uploadedFiles: './output/uploaded-files.json',
  folderCid: './output/folder-cid.json',
  downloadedCids: './output/downloaded-cids.json',
  hashOfHashes: './output/file-hashOfHashes.json',
} as const;
```

## Command Builder Pattern

The `CommandBuilder` class provides a fluent interface for creating commands:

```typescript
const command = new CommandBuilder(name, description)
  .addFileProcessingOptions()      // Add folder + output options
  .addBatchProcessingOptions()     // Add concurrency options
  .addUploadFilesOptions()         // Add upload-specific options
  .addUploadFolderOptions()        // Add folder upload options
  .addHashCalculationOptions()     // Add hash calculation options
  .addDownloadOptions()            // Add download options
  .setDefaultOutput('fileCids')    // Set default output path
  .addOption(customOption)         // Add custom options
  .setAction(handler)              // Set action handler
  .build();                        // Build the command
```

This approach makes command creation more declarative and reduces boilerplate code.
