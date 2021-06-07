import ItemModel from '../models/ItemModel';
import api from '../api/api';
import EventRegister from '../api/EventRegister';

export default class ItemService {
  public static getItemById(itemId: number): Promise<ItemModel|null> {
    return new Promise<ItemModel|null>(resolve => {
      api('GET', '/item/' + itemId, 'user')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

          return resolve(null);
          }

          resolve(res.data as ItemModel);
        })
    })
  }

  public static getItemsByCategoryId(categoryId: number): Promise<ItemModel[]> {
    return new Promise<ItemModel[]>(resolve => {
      api('GET', '/category/all/' + categoryId + '/item', 'user')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve([]);
          }

          resolve(res.data as ItemModel[]);
        })
    })
  }
}
