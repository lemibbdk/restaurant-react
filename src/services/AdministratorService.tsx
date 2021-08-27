import AdministratorModel from '../models/AdministratorModel';
import api from '../api/api';
import EventRegister from '../api/EventRegister';

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
}
