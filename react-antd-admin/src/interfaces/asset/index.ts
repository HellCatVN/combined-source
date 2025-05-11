export interface ISources {
  sourceName: string;
  url: string;
  messageId?: string; // For Discord CDN
}

export interface IAsset {
  _id: string;
  name: string;
  filePath: string;
  isTemp: boolean;
  sources: ISources[];
}

export interface IClientAsset {
  _id: string;
  url: string;
  name: string;
}
