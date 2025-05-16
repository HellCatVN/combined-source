import { z, ZodObject, ZodRawShape } from "zod";
import {
  ISuccessResponse,
  IPagination,
} from "../types/interfaces/response.interface";

export const validatorObject = {
  successResponse: async <T, X extends ZodObject<ZodRawShape>>(
    object: ISuccessResponse<T>,
    validator: X
  ) => {
    try {
      const successResponseValidator = z.object({
        status: z.number(),
        message: z.string(),
        data: validator,
      });
      return await successResponseValidator.parseAsync(object);
    } catch (error: any) {
      const fieldsError = error.issues.map(({ path }: any) => path.join("."));
      throw new TypeError(
        `validation failed. The error fields: ${fieldsError.join(", ")}`
      );
    }
  },
  paginationResponse: async <T, X extends ZodObject<ZodRawShape>>(
    object: IPagination<T>,
    validator: X
  ) => {
    try {
      const validatorResponse = z.object({
        status: z.number(),
        message: z.string().optional(),
        data: z.array(validator),
        pagination: z.object({
          current_page: z.number(),
          limit: z.number(),
          skip: z.number(),
          total: z.number(),
        }),
      });

      return await validatorResponse.parseAsync(object);
    } catch (error: any) {
      const fieldsError = error.issues.map(({ path }: any) => path.join("."));
      throw new TypeError(
        `validation failed. The error fields: ${fieldsError.join(", ")}`
      );
    }
  },
};
