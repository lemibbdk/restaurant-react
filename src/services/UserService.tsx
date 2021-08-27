import ItemModel from '../models/ItemModel';
import api from '../api/api';
import EventRegister from '../api/EventRegister';

export default class UserService {
  public static getUsers(): Promise<ItemModel[]|null> {
    return new Promise<ItemModel[]|null>(resolve => {
      api('GET', '/user', 'administrator')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data as ItemModel[]);
        })
    })
  }
}
