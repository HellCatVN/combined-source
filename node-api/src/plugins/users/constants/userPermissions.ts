import { IUserPermission } from "../interfaces/users.interface";

const userPermissions: IUserPermission[] = [
    {
        action: 'read',
        subject: 'welcome'
    }
];

export default userPermissions;
