import { z, ZodTypeAny } from 'zod';

import {
  validatorClientCensoringReportCase,
  validatorRawCensoringReportCase,
} from '../../bm/validations/censoring-report';
import { validatorClientReportCase, validatorRawReportCase } from '../../bm/validations/report';
import { validatorAsset } from './asset';
import { validatorLog } from './log';
import { validatorUser } from './user';

export const validatorMessageSuccessResponse = () => {
  return z.object({
    message: z.string().min(1),
  });
};

export const validatorSuccessResponse = (dataRules: ZodTypeAny) => {
  return z.object({
    message: z.string(),
    data: dataRules,
  });
};

export const validatorPaginationSuccessResponse = (dataRules: ZodTypeAny) => {
  return z.object({
    data: z.array(dataRules),
    pagination: z.object({
      current_page: z.number(),
      limit: z.number(),
      skip: z.number(),
      total: z.number(),
    }),
  });
};

// AUTHENTICATION ***********
export const validatorResponseAuthentication = validatorSuccessResponse(
  z.object({ user: validatorUser })
);
export const validatorReponseLogout = validatorSuccessResponse(validatorUser);

// ASSET ***********
export const validatorResponseUploadAsset = validatorSuccessResponse(z.array(validatorAsset));

// REPORT ***********
export const validatorResponseCreateReport = validatorMessageSuccessResponse();
export const validatorResponseGetReports =
  validatorPaginationSuccessResponse(validatorRawReportCase);
export const validatorResponseGetReport = validatorSuccessResponse(validatorClientReportCase);
export const validatorResponseDeleteReport = validatorMessageSuccessResponse();
export const validatorResponseUpdateReport = validatorMessageSuccessResponse();

// CENSORING REPORT *******
export const validatorResponseCreateCensoringReport = validatorMessageSuccessResponse();
export const validatorResponseGetCensoringReport = validatorSuccessResponse(
  validatorClientCensoringReportCase
);
export const validatorResponseGetCensoringReports = validatorPaginationSuccessResponse(
  validatorRawCensoringReportCase.extend({
    censorId: z.object({
      _id: z.string().min(1),
      name: z.string().min(1),
      username: z.string().min(1),
    }),
  })
);
export const validatorResponseApproveCensorReport = validatorMessageSuccessResponse();

// USER*****
export const validatorResponseGetUser = validatorSuccessResponse(validatorUser);
export const validatorResponseUpdateUser = validatorSuccessResponse(validatorUser);
export const validatorResponseDeleteUser = validatorSuccessResponse(validatorUser);
export const validatorResponseGetUsers = validatorPaginationSuccessResponse(validatorUser);

// LOG*****
export const validatorResponseGetLogs = validatorPaginationSuccessResponse(validatorLog);
