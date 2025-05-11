# Sync Source Module

This module helps synchronize file contents with a remote source by watching manifest files and updating local files when changes are detected from the Version Control API.

## Features

- Watch multiple manifest files
- Automatically sync files with remote API
- Content-based change detection
- Configurable check interval
- Error handling and logging
- Singleton container for managing multiple watchers

## Setup

1. Set the VERSION_CONTROL_API environment variable in your .env file:
```
VERSION_CONTROL_API=https://your-api-url
```

2. Create manifest.json files for each function you want to watch:
```json
{
  "files": [
    "relative/path/to/file1.ts",
    "relative/path/to/file2.ts"
  ]
}
```

## Usage with Container (Recommended)

```typescript
import { syncSourceContainer } from './modules/sync-source/syncSourceContainer';

// Register functions to watch
await syncSourceContainer.registerFunction(
  'function-name',
  'path/to/manifest.json'
);

// Check which functions are being watched
const watchedFunctions = syncSourceContainer.getWatchedFunctions();
console.log('Watching:', watchedFunctions);

// Stop watching a specific function
syncSourceContainer.stopFunction('function-name');

// Stop all watchers
syncSourceContainer.stopAll();
```

## Direct Usage

```typescript
import SyncSource from './modules/sync-source';
import { sourceApiService } from './modules/sync-source/services/api.service';

// Create instance with 5 second check interval
const syncSource = new SyncSource(5000);

// Register manifest file to watch with a function name
await syncSource.registerManifest(
  'path/to/manifest.json',
  sourceApiService.createUpdateSourceFunction('your-function-name')
);

// Start watching
syncSource.start();

// Stop watching when needed
syncSource.stop();
```

## API Endpoints

The module interacts with one main API endpoint:

GET `/source/{functionName}/files`
- Returns complete file contents for a function
- Response format:
```json
[
  {
    "path": "relative/path/to/file",
    "content": "file content"
  }
]
```

See `swagger.yaml` for complete API documentation.

## Types

```typescript
interface FileContent {
  path: string;    // Path to the file
  content: string; // File content
}

type UpdateSourceFunction = () => Promise<FileContent[]>;
```

## Container Methods

```typescript
class SyncSourceContainer {
  // Register and start watching a function
  registerFunction(functionName: string, manifestPath: string): Promise<void>;
  
  // Stop watching a specific function
  stopFunction(functionName: string): void;
  
  // Stop all watchers
  stopAll(): void;
  
  // Get list of watched functions
  getWatchedFunctions(): string[];
  
  // Check if a function is being watched
  isWatching(functionName: string): boolean;
}
```

## Error Handling

The module includes error handling for:
- Missing environment variables
- API connection issues
- Failed file operations
- Invalid manifest files
- File synchronization issues
- Function registration conflicts

All errors are logged to the console while allowing the watcher to continue running.

## Best Practices

1. Use the container to manage multiple watchers
2. Use relative paths in manifest files
3. Set appropriate API timeout values
4. Configure a suitable check interval based on your needs
5. Set up proper error monitoring
6. Clean up watchers when they're no longer needed
7. Handle process termination by calling stopAll()