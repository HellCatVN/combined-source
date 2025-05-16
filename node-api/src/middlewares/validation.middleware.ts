import { httpStatusCode } from '@constants/httpStatusCode';
import type { NextFunction, Request, Response } from 'express';
import { z, ZodObject } from "zod";

import { HttpException } from '@exceptions/HttpException';

type ValidateObject = any;

const handleValidateObject = async ({ validateObject, object }: { validateObject: ValidateObject; object: Object }) => {
  try {
    await validateObject.validate(object);
    return true;
  } catch (error) {
    return false;
  }
};

export const validationMiddleware = function (validateObjects: ValidateObject[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const worker = [];
    for (const validateObject of validateObjects) {
      worker.push(
        handleValidateObject({
          validateObject,
          object: req.body,
        })
      );
    }
    const response = await Promise.all(worker);
    if (response.some(res => res === true)) {
      console.log('Validation passed');
      return next();
    } else {
      const response = {
        status: httpStatusCode.ClientError.BadRequest,
        message: 'Values invalid',
      };
      return res.status(response.status).json(response);
    }
  };
};

export function validateDataBySchemaMiddleware<T extends z.ZodRawShape>(
  schema: ZodObject<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = schema.safeParse(req.body);
      if (validationResult.success) {
        next();
      } else {
        throw new HttpException(httpStatusCode.ClientError.BadRequest, validationResult.error.issues);
      }
    } catch (error) {
      next(error);
    }

  };
}
