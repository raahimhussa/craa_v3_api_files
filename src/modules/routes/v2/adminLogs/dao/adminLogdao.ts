import { AdminLogEvent, AdminLogScreen } from '../schemas/adminLog.schema';

export default class SimulationLogDao {
  screen: AdminLogScreen;
  event: AdminLogEvent;
  userId: string | null;
  roleId: string | null;
  target?: TargetObject;
  resource?: Resource;
  message?: string;
}

class Resource {
  [key: string]: any;
}

type TargetObject = {
  type: string;
  [key: string]: any;
};
