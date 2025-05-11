import { Container } from "inversify";
import { AuthzService } from "./service/authz.service";
import { EnforcerService } from "./service/enforcer.service";
import AuthzController from "./controller/authz.controller";

export const authzContainer = new Container();

// Bind enforcer service first since authz service depends on it
authzContainer.bind(EnforcerService).toSelf().inSingletonScope();

// Bind authz service
authzContainer.bind(AuthzService).toSelf();

// Bind controller
authzContainer.bind(AuthzController).toSelf();