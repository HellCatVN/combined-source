# Plugin Creation Guide

## Overview

### Plugin Architecture
Plugins are self-contained modules that extend the core API functionality. Each plugin:
- Has its own manifest file defining dependencies and structure
- Maintains isolation through dependency injection containers
- Exposes routes through a standard interface
- Manages its own database schemas
- Follows consistent naming patterns

### Directory Structure
```
plugin-name/
├── manifest.json           # Plugin definition and dependencies
├── index.ts               # Entry point and exports
├── pluginNameContainer.ts # Dependency injection container
├── schema/                # Database models
├── service/              # Business logic
├── controller/           # Route handlers
├── middleware/           # Custom middleware
├── interface/           # TypeScript interfaces
├── utils/              # Helper functions
└── constants/          # Plugin-specific constants
```

### Integration Points
- Route registration via `RouteCreator` function
- Database schema initialization using mongoose models
- Container-based service access
- Middleware integration
- Export of public interfaces

## Required Components

### 1. manifest.json Structure
Example from auth plugin:
```json
{
  "name": "auth",
  "version": "0.0.1", 
  "description": "Authentication plugin for Node API Server.",
  "default": true,
  "packages": {
    "mongoose": "^8.1.1",
    "inversify": "^6.0.2",
    "zod": "^3.22.4"
  },
  "files": [
    {"filePath": "index.ts"},
    {"filePath": "authContainer.ts"},
    {"filePath": "schema/RefreshTokens.ts"},
    {"filePath": "service/auth.service.ts"}
  ]
}
```

### 2. index.ts Pattern
Core plugin entry point exports and initialization:
```typescript
import mongoose, { Connection } from "mongoose";
import { Router } from "express";

// Collection creator function
export const CollectionCreator = (dbInstance: Connection) => {
  return dbInstance.model("ModelName", schema, "CollectionName");
};

// Route creator function
export function RouteCreator(path: string, router: Router) {
  const controller = new Controller();
  router.post(`${path}endpoint`, controller.handler);
}

// Export all public interfaces and components
export * from "./schema/ModelName";
export * from "./service/ServiceName";
export * from "./pluginContainer";
```

### 3. Schema Naming
Schemas should follow the pattern:
- File name: PascalCase.ts
- Schema name: camelCase + 'Schema' 
- Collection name: PascalCase

Example from auth plugin:
```typescript
// schema/RefreshTokens.ts
export const refreshTokensSchema = new Schema({...});
```

### 4. Service Implementation
Services access collections through containers:
```typescript
class AuthService {
  public usersCollection = usersContainer.get<Model<any>>('UsersCollection');
  public refreshTokensCollection = authContainer.get<Model<IRefreshTokens>>('RefreshTokensCollection');

  public async findUser(id: string) {
    return this.usersCollection.findById(id).lean();
  }
}

export default AuthService;
```

### 5. Container Setup
Each plugin has its own container for dependency management:
```typescript
// authContainer.ts
import { Container } from "inversify";

export const authContainer = new Container();
```

## Step-by-Step Guide

### 1. Initial Setup
1. Create plugin directory
2. Create manifest.json with dependencies
3. Setup basic index.ts and container configuration

### 2. Schema Creation
1. Define interfaces in interface/ directory
2. Create schema in schema/ directory
3. Setup model initialization in index.ts

### 3. Service Implementation 
1. Create service class that uses container for collection access
2. Implement business logic methods
3. Export service as default export

### 4. API Endpoints
1. Create controller with route handlers
2. Implement RouteCreator in index.ts
3. Add middleware if needed

### 5. Integration
1. Export necessary interfaces and components
2. Register routes in main application
3. Initialize plugin container
4. Add any plugin-specific middleware

## Best Practices

### Naming Conventions
- Files: descriptive, PascalCase for classes, camelCase for others
- Interfaces: prefix with 'I' (e.g., IUser)
- Services: suffix with 'Service'
- Controllers: suffix with 'Controller'

### Error Handling
- Use HttpException class
- Consistent error response format
- Proper HTTP status codes
- Validation error handling

### Container Usage
- One container per plugin
- Access collections via container.get<Model<T>> which is bind at /src/database.ts

### Database Usage
- Schema validation
- Proper indexing
- Use lean() for better performance
- Clear model interfaces

### Code Organization
- Group related functionality
- Clear separation of concerns
- Consistent file structure
- Proper documentation

## Examples

See the following plugins for reference implementations:
- auth: Authentication and authorization
  - Shows container-based collection access
  - Cross-plugin service dependencies
  - JWT token handling
- users: User management
  - Role-based access control
  - Schema validation
- logs: System logging
  - Event tracking
  - Activity history

Each plugin demonstrates these patterns in a production context.