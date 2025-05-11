import userPermissions from "../../users/constants/userPermissions";
import adminPermissions from "../constants/adminPermission";
import { IUserPermission } from "../../users/interfaces/users.interface";

export const getPermissions = (role: string) => {
  var userPerm: IUserPermission[] = userPermissions;
  switch (role) {
    case "admin":
      userPerm = adminPermissions;
      break;
    default:
      break;
  }
  return userPerm;
};
