import type { ILead } from '../entities/index';

export interface ILeadNotificationService {
  notifyNewLead(lead: ILead): Promise<void>;
}
