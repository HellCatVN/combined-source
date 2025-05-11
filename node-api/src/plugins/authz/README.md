# Authorization Plugin (RBAC + ABAC)

This plugin implements Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) using Casbin. It provides flexible and powerful access control with support for role hierarchies and attribute-based conditions.

## Casbin Model Configuration

The `model.conf` file defines our authorization model using Casbin's PERM (Policy, Effect, Request, Matchers) model format:

```conf
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && \
    r.obj == p.obj && \
    r.act == p.act && \
    eval(p.eft) && \
    keyMatch(r.obj, p.obj)
```

### Explanation

1. **Request Definition** (`r = sub, obj, act`)
   - `sub`: Subject (user or role) requesting access
   - `obj`: Resource being accessed (e.g., "documents", "employee_records")
   - `act`: Action being performed (e.g., "read", "write", "delete")

2. **Policy Definition** (`p = sub, obj, act, eft`)
   - Defines structure of policy rules
   - `eft`: Effect of the policy (allow/deny)
   - Example: `p, admin, documents, read, allow`

3. **Role Definition** (`g = _, _`)
   - Enables RBAC with role inheritance
   - Format: `g, user, role` or `g, role1, role2`
   - Example: `g, alice, admin` (alice has admin role)
   - Example: `g, manager, user` (manager inherits user permissions)

4. **Policy Effect** (`e = some(where (p.eft == allow))`)
   - Determines final result when multiple policies match
   - `some`: Access granted if any matching policy allows it
   - `where (p.eft == allow)`: Only consider "allow" effects

5. **Matchers** (Complex matching logic)
   - `g(r.sub, p.sub)`: Check if subject has required role
   - `r.obj == p.obj`: Resource must match exactly
   - `r.act == p.act`: Action must match exactly
   - `eval(p.eft)`: Evaluate policy effect
   - `keyMatch(r.obj, p.obj)`: Pattern matching for resources

## Examples

### Basic Role Policy
```
p, admin, documents, read, allow
p, user, documents, write, deny
g, alice, admin
```
- Alice has admin role
- Admins can read documents
- Users cannot write documents

### ABAC Policy with Conditions
```typescript
await enforcer.addPolicy('hr_manager', 'employee_records', 'view', 'allow', 
  'r.context.department == "HR" && r.context.clearanceLevel >= 3');
```
- HR managers can view employee records
- Only if they're in HR department
- And have clearance level 3 or higher

### Role Hierarchy
```
g, manager, user
p, user, documents, read, allow
```
- Managers inherit all user permissions
- Since users can read documents, managers can too

## Usage

1. **Creating Roles with ABAC**:
```typescript
const roleData = {
  name: "hr_manager",
  description: "HR Department Manager",
  abacPolicies: [{
    resource: "employee_records",
    action: "view",
    conditions: [{
      attribute: "department",
      operator: "equals",
      value: "HR"
    }, {
      attribute: "clearanceLevel",
      operator: "greaterThan",
      value: 2
    }]
  }]
};

await authzService.createRole(roleData, "superadmin");
```

2. **Validating Access**:
```typescript
const context = {
  department: "HR",
  clearanceLevel: 3
};

const hasAccess = await authzService.validateAccess(
  roleId,
  "employee_records",
  "view",
  context
);
```

## Storage

Policies are stored in MongoDB using the official casbin-mongoose-adapter. The adapter:
- Loads policies efficiently during startup
- Persists policy changes automatically
- Maintains role hierarchies and ABAC rules
- Provides scalable policy storage

## Security Notes

1. Only superadmin can modify roles and policies
2. Role inheritance is checked recursively
3. ABAC conditions are evaluated securely using Casbin's built-in evaluator
4. Failed access attempts are logged for auditing