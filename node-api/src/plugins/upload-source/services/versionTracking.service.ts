import { Model } from "mongoose";
import { HttpException } from "../../../exceptions/HttpException";
import { syncSourceContainer } from "../../sync-source/syncSourceContainer";

interface IVersionTracking {
  sourceId: string;
  currentVersion: string;
  lastUpdated: Date;
  isUpdateInProgress: boolean;
}

class VersionTrackingService {
  private model: Model<IVersionTracking>;

  constructor() {
    this.model = syncSourceContainer.get(
      "VersionTrackingCollection"
    ) as Model<IVersionTracking>;
  }

  async checkUpdateInProgress(sourceId: string): Promise<void> {
    const tracking = await this.model.findOne({ sourceId });
    if (tracking?.isUpdateInProgress) {
      throw new HttpException(
        409,
        "An update is already in progress for this source"
      );
    }
  }

  async setUpdateInProgress(sourceId: string, inProgress: boolean): Promise<void> {
    await this.model.updateOne(
      { sourceId },
      { $set: { isUpdateInProgress: inProgress } },
      { upsert: true }
    );
  }

  generateVersionIncrement(isNewFile: boolean): "minor" | "patch" {
    return isNewFile ? "minor" : "patch";
  }
}

export const versionTrackingService = new VersionTrackingService();