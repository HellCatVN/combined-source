# Authorization Plugin (authz)

## Overview

The authz plugin implements a hybrid RBAC/ACL (Role-Based Access Control/Access Control List) system that provides flexible, database-driven permission management. Key features include:

- Resource-based permission management
- Role-based access control
- Dynamic endpoint configuration
- Flexible middleware options
- Database-driven permission checks

## Components

### 1. AuthzRoles Schema
Manages role definitions and their associated permissions:
```typescript
interface Role {
  name: string;
  description?: string;
  permissions: Map<string, string[]>;
  isSystem?: boolean;
  hasPermission(resource: string, action: string): boolean;
}
```

### 2. AuthzResources Schema
Defines protected resources and their allowed actions:
```typescript
interface IResource {
  name: string;
  description?: string;
  allowedActions: string[];
  isActive: boolean;
}
```

### 3. AuthzEndpointConfig Schema
Maps API endpoints to required permissions:
```typescript
interface IEndpointConfig {
  path: string;
  method: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}
```

### 4. AuthzPermissions Schema
Tracks permission assignments:
```typescript
interface Permission {
  resourceName: string;
  actions: string[];
  description?: string;
}
```

## API Endpoints

### Resource Management
```typescript
// Create resource
POST /resources
{
  "name": "articles",
  "description": "Blog articles",
  "allowedActions": ["read", "create", "update", "delete"]
}

// List resources
GET /resources

// Update resource
PUT /resources/:id
{
  "allowedActions": ["read", "create", "update", "delete", "publish"]
}

// Delete resource
DELETE /resources/:id
```

### Role Management
```typescript
// Create role
POST /roles
{
  "name": "editor",
  "description": "Content editor",
  "permissions": {
    "articles": ["read", "create", "update"],
    "comments": ["read", "delete"]
  }
}

// List roles
GET /roles

// Update role
PUT /roles/:id
{
  "permissions": {
    "articles": ["read", "create", "update", "publish"]
  }
}

// Delete role
DELETE /roles/:id
```

### Endpoint Configuration
```typescript
// Create endpoint config
POST /endpoint-configs
{
  "path": "/api/articles/:id",
  "method": "PUT",
  "resource": "articles",
  "action": "update"
}

// List configs
GET /endpoint-configs

// Update config
PUT /endpoint-configs/:id
{
  "isActive": false
}

// Delete config
DELETE /endpoint-configs/:id
```

## Middleware Usage

### Basic Permission Check
```typescript
import { checkPermission } from './authz/middleware/authz.middleware';

// Check specific permission
router.post('/articles', 
  checkPermission('articles', 'create'), 
  createArticle
);

// Dynamic permission check based on endpoint config
router.put('/articles/:id',
  dynamicPermissionCheck,
  updateArticle
);
```

### Advanced Permission Checks
```typescript
// Check multiple permissions (ANY)
router.delete('/articles/:id',
  checkAnyPermission([
    { resource: 'articles', action: 'delete' },
    { resource: 'admin', action: 'manage_content' }
  ]),
  deleteArticle
);

// Check multiple permissions (ALL)
router.post('/articles/:id/publish',
  checkAllPermissions([
    { resource: 'articles', action: 'update' },
    { resource: 'articles', action: 'publish' }
  ]),
  publishArticle
);

// Pattern-based endpoint permission check
router.get('/articles/*',
  checkEndpointPermission,
  getArticle
);
```

### Custom Database Configuration
```typescript
// Override database model in middleware
import { AuthzService } from './authz/service/authz.service';
import customAuthzModel from './models/customAuthz';

const authzService = new AuthzService(customAuthzModel);
router.use(checkPermission('resource', 'action', authzService));
```

## Integration Example

```typescript
import express from 'express';
import { authzMiddleware } from './authz/middleware';

const app = express();

// Apply global dynamic permission checking
app.use(dynamicPermissionCheck);

// Protected routes
router.post('/articles',
  checkPermission('articles', 'create'),
  async (req, res) => {
    // Create article logic
  }
);

router.put('/articles/:id',
  checkAnyPermission([
    { resource: 'articles', action: 'update' },
    { resource: 'admin', action: 'manage_content' }
  ]),
  async (req, res) => {
    // Update article logic
  }
);

// Resource management routes
router.get('/resources',
  checkPermission('authz', 'manage'),
  authzController.getResources
);

// Role management routes
router.post('/roles',
  checkPermission('authz', 'manage'),
  authzController.createRole
);
```

This authorization system provides flexible, granular access control that can be easily configured and extended. The hybrid RBAC/ACL approach allows for both role-based permissions and direct resource-action permissions, while the database-driven design enables dynamic permission updates without code changes.