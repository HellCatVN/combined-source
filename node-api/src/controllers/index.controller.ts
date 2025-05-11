import { NextFunction, Request, Response } from 'express';
import I18nService from '@services/i18n.service';

class IndexController {
  private i18nService: I18nService;

  constructor() {
    this.i18nService = I18nService.getInstance();
  }

  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send({
        message: 'Station API Server',
        version: req.apiVersion,
        language: req.language,
        data: {
          welcome: this.i18nService.translate('welcome'),
          description: this.i18nService.translate('description'),
          api: {
            success: this.i18nService.translate('api.success'),
            error: this.i18nService.translate('api.error'),
            notFound: this.i18nService.translate('api.notFound')
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
