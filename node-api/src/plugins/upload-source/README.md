# Upload Source Plugin

This plugin complements the existing `sync-source` functionality by allowing users to upload local code changes to remote locations. While `sync-source` handles remote-to-local synchronization, this plugin manages local-to-remote file uploads.

## Features

- Upload local file changes to remote version control
- Automatic file content detection and comparison
- Support for recursive directory scanning
- Integration with existing source management system

## Configuration

The plugin requires the following environment variables:

```env
VERSION_CONTROL_API=<api_url>
UPLOAD_SOURCE_SERVICE_TOKEN=<upload_token>
SYNC_SOURCE_SERVICE_TOKEN=<sync_token>
```

## API Endpoints

### Upload Source Changes

Uploads local changes to the remote version control system.

```http
POST /upload-source
Content-Type: application/json

{
  "sourceId": "string"
}
```

#### Request Parameters

- `sourceId` (required): The ID of the source to upload changes to

#### Response

```json
{
  "success": true,
  "message": "Successfully uploaded X files"
}
```

#### Error Responses

- `400 Bad Request`: Missing sourceId parameter
- `404 Not Found`: Source not found
- `500 Internal Server Error`: Error during file upload process

## Integration with sync-source

This plugin works in conjunction with the `sync-source` plugin to provide bidirectional synchronization:

1. `sync-source`: Handles remote-to-local synchronization
2. `upload-source`: Handles local-to-remote file uploads

## Usage Example

```typescript
// Upload changes for a specific source
await axios.post('/upload-source', {
  sourceId: 'example-source-id'
});
```

## Dependencies

- `sync-source` plugin: Uses shared services for file system operations and path mapping
- Express.js: Web framework for API endpoints
- Axios: HTTP client for making API requests

## Error Handling

The plugin implements comprehensive error handling for:
- Missing or invalid source IDs
- File system access errors
- Remote API communication issues
- File content reading/writing errors