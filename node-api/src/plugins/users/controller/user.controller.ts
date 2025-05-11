import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongoose';

// Services
import UserService from '../service/user.service';

// Interfaces
import { RequestWithUser } from '../../auth/interface/auth.interface';

// Enums
import { RecordDeleteType } from '@enum/RecordDeleteType.enum';

class UsersController {
    public userService = new UserService();

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { index, size, ...filters } = req.query;
            const limit = parseInt(String(size)) || 10;
            const page = parseInt(String(index)) || 1
            const query = filters ? { ...filters } : {};
            const findAllUsersData = await this.userService.findAllUser({ limit, page, query });

            res.status(200).json(findAllUsersData);
        } catch (error) {
            next(error);
        }
    };

    public getUserBootStrapData = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.user._id;
            const { userInfo } = await this.userService.getUserBootStrapData(userId);

            const response = {
                status: 200,
                message: 'findOne',
                data: userInfo,
            }
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public getUserById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const username: string = req.params.username;
            const findOneUserData = await this.userService.findUserById(username);

            const response = {
                status: 200,
                data: findOneUserData,
                message: 'findOne',
            }

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public deleteUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const username: string = req.params.username;
            const userActionId = req.user._id as unknown as ObjectId;
            const deleteUserData = await this.userService.deleteUser(username, userActionId, req.headers['x-delete-type'] as RecordDeleteType);

            const response = {
                status: 200,
                message: `User '${username}' has been deleted`,
                data: deleteUserData,
            }

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public updateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const username: string = req.params.username;
            const userData = req.body;
            const userActionId = req.user._id as unknown as ObjectId;
            const updateUserData = await this.userService.updateUser(username, userData, userActionId);

            const response = {
                status: 200,
                message: `User '${username}' has been updated`,
                data: updateUserData
            }

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}

export default UsersController;
