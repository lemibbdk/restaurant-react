import IModel from './IModel.interface';

export default class AdministratorModel implements IModel {
  administratorId: number;
  username: string;
  passwordHash: string;
  isActive: boolean;
}
