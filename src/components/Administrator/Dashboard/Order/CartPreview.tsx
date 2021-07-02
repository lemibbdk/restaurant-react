import { Modal } from 'react-bootstrap';
import CartModel from '../../../../models/CartModel';
import ItemService from '../../../../services/ItemService';
import { AppConfiguration } from '../../../../config/app.config';
import React from 'react';

interface CartPreviewProperties {
  cart: CartModel;
  onClose: () => any;
}

export default class CartPreview extends React.Component<CartPreviewProperties> {
  render() {
    return (
      <Modal show size="lg" centered onHide={this.props.onClose}>
        <Modal.Header>
          <Modal.Title>Shopping cart listing</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <table className="table table-sm cart-table">
            <thead>
            <tr>
              <th colSpan={2}>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Sum</th>
            </tr>
            </thead>
            <tbody>
            {this.props.cart.itemInfos.map(el => (
              <tr key={"cart-item-" + el.cartItemId}>
                <td>
                  <img alt={el.itemInfo.item?.name}
                       src={ItemService.getThumbPath(AppConfiguration.API_URL + "/" + el.itemInfo.item?.photos[0].imagePath)}
                       className="item-image" />
                </td>
                <td>
                  <b className="h5">{el.itemInfo.item?.name}</b> <br/>
                  <small>({el.itemInfo.item?.category?.name})</small>
                </td>
                <td>
                  &euro; { Number(el.itemInfo.price).toFixed(2) }
                </td>
                <td>
                  { el.quantity }
                </td>
                <td>
                  &euro; { Number(el.itemInfo.price * el.quantity).toFixed(2) }
                </td>
              </tr>
            ))}
            </tbody>
            <tfoot>
            <tr>
              <td colSpan={4}> </td>
              <td>
                &euro; {
                this.props.cart.itemInfos
                  .map(el => el.quantity * el.itemInfo.price)
                  .reduce((sum, value) => sum + value, 0)
                  .toFixed(2)
              }
              </td>
            </tr>
            <tr>
              <th>Order ID:</th>
              <td colSpan={4}>#{ this.props.cart.order?.orderId }</td>
            </tr>
            <tr>
              <th>Order date:</th>
              <td colSpan={4}>{ this.props.cart.order?.createdAt }</td>
            </tr>
            <tr>
              <th>Status:</th>
              <td colSpan={4}>{ this.props.cart.order?.status }</td>
            </tr>
            <tr>
              <th>Forename:</th>
              <td colSpan={4}>{ this.props.cart.user.forename }</td>
            </tr>
            <tr>
              <th>Surname:</th>
              <td colSpan={4}>{ this.props.cart.user.surname }</td>
            </tr>
            <tr>
              <th>E-mail:</th>
              <td colSpan={4}>{ this.props.cart.user.email }</td>
            </tr>
            <tr>
              <th>Address:</th>
              <td colSpan={4}>{this.props.cart.order?.address.address}</td>
            </tr>
            </tfoot>
          </table>
        </Modal.Body>
      </Modal>
    )
  }
}
