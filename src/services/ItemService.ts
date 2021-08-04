import ItemModel from '../models/ItemModel';
import api, { ApiRole } from '../api/api';
import EventRegister from '../api/EventRegister';
import * as path from 'path';

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

  public static getItemsByCategoryId(categoryId: number, role: ApiRole = 'user'): Promise<ItemModel[]> {
    return new Promise<ItemModel[]>(resolve => {
      api('GET', '/category/all/' + categoryId + '/item', role)
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



  public static getThumbPath(url: string): string {
    const directory = path.dirname(url);
    const extension = path.extname(url);
    const filename  = path.basename(url, extension);
    return directory + '/' + filename + '-thumb' + extension;
  }

  public static getSmallPath(url: string): string {
    const directory = path.dirname(url);
    const extension = path.extname(url);
    const filename  = path.basename(url, extension);
    return directory + '/' + filename + '-small' + extension;
  }
}
