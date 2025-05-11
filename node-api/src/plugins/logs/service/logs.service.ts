import { Model } from "mongoose";

import { logsContainer } from "../logsContainer";
import { paginate } from "@helpers/pagination";

// Constants & Exceptions

// Utils & Configs

// Interfaces
import { IPagination } from "@interfaces/response.interface";
import { ILogs } from "../interface/logs.interface";

export class LogsService {
  public logsCollection = logsContainer.get<Model<ILogs>>("LogsCollection");

  async createLog(logData: Partial<ILogs>) {
    await this.logsCollection.create(logData);
  }

  async findAllLogs({
    limit,
    page,
    query,
  }: {
    limit: number;
    page: number;
    query: object;
  }): Promise<IPagination<ILogs[]>> {
    const findAllLogsData = await paginate<ILogs>({
      model: this.logsCollection,
      filter: query,
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
      populate: [
        {
          path: "userActionId",
          select: ["username", "_id"],
        },
      ],
    });

    return {
      data: findAllLogsData.data,
      pagination: findAllLogsData.pagination,
    };
  }

  async deleteLogById(logId: string): Promise<ILogs | null> {
    return this.logsCollection.findByIdAndDelete(logId).exec();
  }
}

