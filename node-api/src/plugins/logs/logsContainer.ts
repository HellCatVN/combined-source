import { Container } from 'inversify';
import { LogsService } from './service/logs.service';
import { LogsController } from './controller/logs.controller';

const logsContainer = new Container();

// Services
logsContainer.bind<LogsService>('LogsService').to(LogsService);

// Controllers
logsContainer.bind<LogsController>('LogsController').to(LogsController);

export { logsContainer };
