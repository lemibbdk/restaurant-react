import ItemModel from '../models/ItemModel';
import api, { apiAsForm, ApiResponse, ApiRole } from '../api/api';
import EventRegister from '../api/EventRegister';
import * as path from 'path';

export interface IAddItem {
  name: string;
  ingredients: string;
  itemInfoAll: IItemInfoAdd[];
  photos: File[];
  categoryId: number;
}

export interface IEditItem {
  name: string;
  ingredients: string;
  itemInfoAll: IItemInfoEdit[];
}

interface IItemInfoAdd {
  size: string;
  energyValue: number;
  mass: number;
  price: number;
}

interface IItemInfoEdit {
  itemInfoId: number|null;
  energyValue: number;
  mass: number;
  price: number;
}

interface IResult {
  success: boolean;
  message?: string;
}

export default class ItemService {
  public static getItemById(itemId: number, role: ApiRole = 'user'): Promise<ItemModel|null> {
    return new Promise<ItemModel|null>(resolve => {
      api('GET', '/item/' + itemId, role)
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

  public static editItem(itemId: number, data: IEditItem): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      api('PUT', '/item/' + itemId, 'administrator', data)
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

  public static addPhotos(itemId: number, photos: FileList): Promise<IResult> {
    return new Promise<IResult>(resolve => {

      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();
        formData.append( 'photo'+i, photos[i]);

        apiAsForm('POST', '/item/' + itemId + '/photo', 'administrator', formData)
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
      }

    })
  }

  public static deletePhotos(itemId: number, photoIds: []): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      for (let photoId of photoIds) {
        api('DELETE', 'item/' + itemId + '/photo/' + photoId, 'administrator')
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
      }
    })
  }

  public static delete(itemId: number): Promise<ApiResponse | null> {
    return new Promise<ApiResponse|null>(resolve => {
      api('DELETE', '/item/' + itemId, 'administrator')
        .then(res => {
          if (res?.status !== 'ok') {
            if (res.status === 'login') {
              EventRegister.emit('AUTH_EVENT', 'force_login');
            }

            return resolve(null);
          }

          resolve(res.data)
        })
    });
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
