import { NextFunction, Request, Response } from "express"

// Services
import { LogsService } from "../service/logs.service";

// Utils & Validators
import { validatorObject } from "@utils";
import { logValidatorSchema } from "../validator";

export class LogsController {
    private logsService = new LogsService()

    public getLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { index, size, ...filters } = req.query;
            const limit = parseInt(String(size)) || 10;
            const page = parseInt(String(index)) || 1
            const query = filters ? { ...filters } : {};
            const findAllLogsData = await this.logsService.findAllLogs({ query, page, limit });

            const docsToRemove = findAllLogsData.data.filter(doc => doc.userActionId == null);

            if (docsToRemove.length > 0) {
                for (const doc of docsToRemove) {
                    await this.logsService.deleteLogById(doc._id.toString());
                    findAllLogsData.data = findAllLogsData.data.filter(d => d._id.toString() !== doc._id.toString());
                }
            }
            const response = await validatorObject.paginationResponse({
                status: 200,
                message: "Logs retrieved successfully",
                data: findAllLogsData.data,
                pagination: findAllLogsData.pagination
            }, logValidatorSchema);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
