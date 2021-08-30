import AdministratorModel from '../models/AdministratorModel';
import api from '../api/api';
import EventRegister from '../api/EventRegister';

interface IAdministratorAdd {
  username: string;
  password: string;
}

export default class AdministratorService {
  public static getAdministrators(): Promise<AdministratorModel[]|null> {
    return new Promise<AdministratorModel[]|null>(resolve => {
      api('GET', '/administrator', 'administrator')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as AdministratorModel[]);
        })
    })
  }

  public static addAdministrator(data: IAdministratorAdd): Promise<AdministratorModel|null> {
    return new Promise<AdministratorModel|null> (resolve => {
      api('POST', '/administrator', 'administrator', data)
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as AdministratorModel);
        })
    })
  }
}
