import { userRoleManager } from "@plugins/users/utils/userRole"; //TODO: fix this
import { customUserPayloadRules } from "./rules";

const userCustomValidation = {
  customUserPayloadRules: customUserPayloadRules(
    userRoleManager.getUserRoles
  ) as any,
};
