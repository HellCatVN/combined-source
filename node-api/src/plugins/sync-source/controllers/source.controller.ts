import { NextFunction, Request, Response } from "express";
import { SourceService } from "../services/source.service";
import { HttpException } from "../../../exceptions/HttpException";

export default class SourceController {
  private sourceService = new SourceService();

  public updateSource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sourceId } = req.body;

      if (!sourceId) {
        throw new HttpException(400, "sourceId is required");
      }

      await this.sourceService.updateSource(sourceId);

      res.status(200).json({
        status: 200,
        message: "Source updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getSources = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sources = await this.sourceService.getSources();

      if (!sources.sources.length) {
        throw new HttpException(404, "No sources found");
      }

      res.status(200).json({
        status: 200,
        message: "Sources retrieved successfully",
        data: {
          sources: sources.sources,
          isUpdateInProgress: sources.isUpdateInProgress,
        },
      });
    } catch (error) {
      console.log(error);
      next(`Can't get sources`);
    }
  };
}
