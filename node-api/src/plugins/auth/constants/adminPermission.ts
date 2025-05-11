import { IUserPermission } from "../../users/interfaces/users.interface";

//TODO:  refactor authz(authorization)
const adminPermissions: IUserPermission[] = [
  {
    action: "manage",
    subject: "all", 
  },
];

export default adminPermissions;

