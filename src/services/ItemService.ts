import ItemModel from '../models/ItemModel';
import api, { apiAsForm, ApiRole } from '../api/api';
import EventRegister from '../api/EventRegister';
import * as path from 'path';

export interface IAddItem {
  name: string;
  ingredients: string;
  itemInfoAll: IItemInfo[];
  photos: File[];
  categoryId: number;
}

interface IItemInfo {
  size: string;
  energyValue: number;
  mass: number;
  price: number;
}

interface IResult {
  success: boolean;
  message?: string;
}

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

  public static addNewItem(data: IAddItem): Promise<IResult> {
    return new Promise<IResult>(resolve => {

      const formData = new FormData();
      formData.append("data", JSON.stringify({
        name: data.name,
        ingredients: data.ingredients,
        itemInfoAll: data.itemInfoAll,
        categoryId: data.categoryId
      }))

      for (let photo of data.photos) {
        formData.append("photo", photo)
      }

      apiAsForm('POST', '/item', 'administrator', formData)
        .then(res => {
          if (res?.status === 'error') {
            if (Array.isArray(res?.data?.data)) {
              return resolve({
                success: false,
                message: res?.data.data[0].instancePath.replace('/', '') + ' ' + res?.data.data[0].message
              });
            }

            return resolve({
              success: false,
              message: JSON.stringify(res?.data?.data)
            });
          }

          return resolve({
            success: true
          })
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
