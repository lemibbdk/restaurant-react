import CartModel from '../models/CartModel';
import api from '../api/api';
import { MemoizeExpiring } from 'typescript-memoize';
import EventRegister from '../api/EventRegister';

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

  public static setToCart(itemInfoId: number, newQuantity: number) {
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

  public static makeOrder() {
    api('POST', '/cart/order', 'user')
      .then(res => {
        if (res.status !== 'ok') {
          EventRegister.emit('ORDER_EVENT', 'order.failed', res.data);
        } else {
          EventRegister.emit('ORDER_EVENT', 'order.success', res.data);
        }

        EventRegister.emit('CART_EVENT', 'cart.update');
      });
  }
}
