# Authorization Plugin

This plugin provides role-based access control (RBAC) with support for fine-grained permissions and special access cases.

## Features

- Role-based access control
- Resource and action-based permissions
- Special access cases (wildcards and superadmin)
- Hierarchical permissions
- System roles protection

## Core Concepts

### Roles

Roles are collections of permissions that can be assigned to users. The system includes the following default roles:

- `superadmin`: Has unrestricted access to all resources and actions (uses wildcards)
- `admin`: Has full access to all defined resources
- `manager`: Has full access to users and read access to resources
- `user`: Has basic read/update permissions

### Resources

Resources represent the entities or features that can be accessed. Each resource has:

- Name (unique identifier)
- Description
- Allowed Actions
- Active Status

### Permissions

Permissions are combinations of:
- Resource
- Action

Special cases:
- Resource wildcards: `'all'` or `'*'` grants access to all resources
- Action wildcards: `'*'` or `'manage'` grants all actions on a resource

### Special Access Cases

1. Super Admin Role:
   - Designated by role name `'superadmin'`
   - Has unrestricted access to all resources and actions
   - Bypasses all permission checks

2. Special Resources:
   - `'all'` or `'*'`: Matches any resource
   - Useful for granting broad access rights

3. Special Actions:
   - `'*'`: All actions on a resource
   - `'manage'`: Full control over a resource
   - Hierarchical actions (e.g., `'posts:*'` matches `'posts:create'`)

## Usage

### Creating Roles

```typescript
await authzService.createRole({
  name: 'editor',
  description: 'Content editor role',
  permissions: [
    { resource: 'posts', action: 'manage' },
    { resource: 'comments', action: 'moderate' }
  ]
});
```

### Checking Permissions

```typescript
const hasAccess = await authzService.checkPermission({
  user,
  resource: 'posts',
  action: 'create'
});
```

### Super Admin Access

```typescript
await authzService.createRole({
  name: 'superadmin',
  description: 'Unrestricted access',
  permissions: [
    { resource: 'all', action: '*' }
  ]
});
```

## API Reference

### AuthzService Methods

- `createRole(roleData: CreateRoleDto)`
- `getRoles()`
- `updateRole(id: string, roleData: UpdateRoleDto)`
- `deleteRole(id: string)`
- `checkPermission(params: CheckPermissionParams)`
- `getPermissions()`
- `createResource(resourceData: CreateResourceDto)`
- `getResources()`
- `updateResource(id: string, resourceData: UpdateResourceDto)`
- `deleteResource(id: string)`
- `createEndpointConfig(configData: CreateEndpointConfigDto)`
- `getEndpointConfigs()`
- `updateEndpointConfig(id: string, configData: UpdateEndpointConfigDto)`
- `deleteEndpointConfig(id: string)`