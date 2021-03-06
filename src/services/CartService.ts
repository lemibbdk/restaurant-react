import CartModel, { CartItemModel, OrderStatus } from '../models/CartModel';
import api, { ApiRole } from '../api/api';
import { MemoizeExpiring } from 'typescript-memoize';
import EventRegister from '../api/EventRegister';

interface IEditCart {
  cartId: number;
  itemInfos: CartItemModel[];
  order: IEditOrder;
}

interface IEditOrder {
  orderId: number;
  addressId: number;
  desiredDeliveryTime: Date;
  footnote: string;
}

interface IResult {
  success: boolean;
  message?: string;
}

interface IAddEvaluation {
  orderId: number;
  cartId: number;
  score: string;
  remark: string;
}

export default class CartService {
  @MemoizeExpiring(2000)
  public static getCart(): Promise<CartModel|null> {
    return new Promise<CartModel|null>(resolve => {
      api('GET', '/cart', 'user')
        .then(res => {
          if (res.status !== 'ok') return resolve(null);

          resolve(res.data);
        })
    });
  }

  public static addToCart(itemInfoId: number, quantity: number) {
    api('POST', '/cart', 'user', {
      itemInfoId,
      quantity
    })
      .then(res => {
        if (res.status !== 'ok') return;
        if (res.data.errorCode !== undefined) return;
        EventRegister.emit('CART_EVENT', 'cart.add', itemInfoId, quantity);
      });
  }

  public static setToCart(itemInfoId: number, newQuantity: number, notLastCart: boolean = false, cartId: number = 0) {
    if (notLastCart) {
      if (cartId === 0) return;

      api('PUT', '/cart', 'user', {
        itemInfoId,
        quantity: newQuantity,
        notLastCart,
        cartId
      })
        .then(res => {
          if (res.status !== 'ok') return;
          if (res.data.errorCode !== undefined) return;
          EventRegister.emit('CART_EDIT_EVENT', res.data);
        });
    } else {
      api('PUT', '/cart', 'user', {
        itemInfoId,
        quantity: newQuantity
      })
        .then(res => {
          if (res.status !== 'ok') return;
          if (res.data.errorCode !== undefined) return;
          EventRegister.emit('CART_EVENT', 'cart.update', itemInfoId, newQuantity);
        });
    }
  }

  public static makeOrder(desiredDeliveryTime: Date, footnote: string, addressId: number): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      api('POST', '/cart/order', 'user', {
        desiredDeliveryTime,
        footnote,
        addressId
      })
        .then(res => {
          if (res.status !== 'ok') {
            if (Array.isArray(res?.data?.data)) {
              const field = res?.data?.data[0]?.instancePath.replace('/', '');
              const msg   = res?.data?.data[0]?.message;
              const error = field + ' ' + msg;
              EventRegister.emit('ORDER_EVENT', 'order.failed', res.data);
              return resolve({
                success: false,
                message: error,
              });
            } else if (typeof res?.data?.data === 'string' || res?.data?.data instanceof String) {
              return resolve({
                success: false,
                message: res?.data?.data
              })
            }

            EventRegister.emit('ORDER_EVENT', 'order.failed', res.data);
            resolve({success: false})
          } else {
            resolve({
              success: true,
              message: ''
            })
            EventRegister.emit('ORDER_EVENT', 'order.success', res.data);
          }

          EventRegister.emit('CART_EVENT', 'cart.update');
          resolve(res.data)
        });
    })
  }

  public static editCart(cartId: number, data: IEditCart): Promise<IResult> {
    return new Promise<IResult>(resolve => {
      api('PUT', '/cart/' + cartId + '/edit', 'user', data)
        .then(res => {
          if (res.status === 'error') {
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

          resolve({
            success: true
          })
        })
    })
  }

  public static getAllOrders(): Promise<CartModel[]> {
    return new Promise<CartModel[]>(resolve => {
      api('GET', '/order', 'administrator')
        .then(res => {
          if (res.status !== 'ok') {
            return resolve([]);
          }
          resolve(res.data);
        })
    });
  }

  public static setOrderStatus(cartId: number, status: OrderStatus, role: ApiRole) {
    api('PUT', '/cart/' + cartId, role, { status })
      .then(res => {
        if (res.status !== 'ok') return;
        if (res.data.errorCode !== undefined) return;
        EventRegister.emit('ORDER_EVENT', 'order.updated', cartId);
      });
  }

  public static getUserOrders(): Promise<CartModel[]> {
    return new Promise<CartModel[]>(resolve => {
      api('GET', '/cart/order/my', 'user')
        .then(res => {
          if (res.status !== 'ok') {
            return resolve([])
          }

          resolve(res.data);
        })
    })
  }

  public static addEvaluation(data: IAddEvaluation) {
    return new Promise<IResult>(resolve => {
      api('POST', '/evaluation', 'user', data)
        .then(res => {
          if (res.status !== 'ok') {
            return resolve({
              success: false
            })
          }

          resolve({
            success: true
          })
        })
    })
  }
}
