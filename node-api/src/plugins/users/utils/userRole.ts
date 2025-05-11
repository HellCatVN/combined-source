import { BASIC_ROLES } from "../constants/role";

class UserRoleManager {
  private userRoles: string[] = BASIC_ROLES;

  appendRoles(optionalRoles: string[]) {
    this.userRoles = this.userRoles.concat(optionalRoles);
  }
  
  public get getUserRoles() {
    return this.userRoles.reduce((prev, curr) => {
      prev[curr] = curr;
      return prev;
    }, {} as any); 
  }
  
}

export const userRoleManager = new UserRoleManager();