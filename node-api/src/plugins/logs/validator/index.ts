import mongoose from "mongoose";
import { z } from "zod";

export const logValidatorSchema = z.object({
  userActionId: z.object({
    _id: z.instanceof(mongoose.Types.ObjectId),
    username: z.string().min(1),
  }),
  action: z.string().min(1),
  record: z.string().min(1),
  schema: z.string().min(1),
  note: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});
