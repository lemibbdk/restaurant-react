import CartModel, { OrderStatus } from '../../models/CartModel';
import BasePage from '../BasePage/BasePage';
import { isRoleLoggedIn } from '../../api/api';
import EventRegister from '../../api/EventRegister';
import CartService from '../../services/CartService';
import { Button } from 'react-bootstrap';
import CartPreview from '../Administrator/Dashboard/Order/CartPreview';
import React from 'react';
import { Link } from 'react-router-dom';
import './OrdedList.sass';

interface OrderListState {
  carts: CartModel[];
  displayedCart: CartModel | null;
}

export default class OrderList extends BasePage<{}> {
  state: OrderListState;

  constructor(props: any) {
    super(props);

    this.state = {
      carts: [],
      displayedCart: null
    }
  }

  componentDidMount() {
    isRoleLoggedIn('user')
      .then(result => {
        if (!result) return EventRegister.emit('AUTH_EVENT', 'force_login');
      })

    this.getOrders()
  }

  private getOrders() {
    CartService.getUserOrders()
      .then(res => {
        console.log(res)
        this.setState({carts: res});
      })
  }

  getLocalDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  private cancelOrder(cartId: number) {
    CartService.setOrderStatus(cartId, 'rejected', 'user');

    this.setState((state: OrderListState) => {
      for (let cart of state.carts) {
        if (cart.cartId === cartId && cart.order) {
          cart.order.status = 'rejected' as OrderStatus;
          break;
        }
      }

      return state;
    });
  }

  renderMain(): JSX.Element {
    return (
      <>
        <div>
          <h1 className="text-center">Your Orders</h1>
        </div>

        <table className="table table-sm table-order">
          <thead>
          <tr>
            <th>#ID</th>
            <th>Date and Time</th>
            <th>Total price</th>
            <th>Status</th>
            <th>Options</th>
          </tr>
          </thead>
          <tbody>
          {
            this.state.carts.map(cart => (
              <tr key={"order-cart-" + cart.cartId}>
                <td>{ cart.order?.orderId }</td>
                <td>{ this.getLocalDate(cart.order?.createdAt + "") }</td>
                <td>&euro; {cart.itemInfos.map(el => el.quantity * el.itemInfo.price)
                  .reduce((sum, v) => sum + v, 0)
                  .toFixed(2)
                }
                </td>
                <td>
                  { cart.order?.status }
                </td>
                <td>
                  <Button
                    variant="danger"
                    className={ cart.order?.status !== 'pending' ? 'd-none' : '' }
                    onClick={ () => this.cancelOrder(cart.cartId) } >
                    <i className="bi bi-x-square-fill" />
                  </Button>
                  <Link className={ cart.order?.status !== 'pending' ?  "d-none" : "nav-link"}
                        to={"/cart/" + cart.cartId + "/edit" }>
                    <Button
                      variant="primary"
                      className="ms-2"
                      disabled={ cart.order?.status !== 'pending' } >
                      <i className="bi bi-pencil-fill" />
                    </Button>
                  </Link>
                  <Link className={ cart.order?.status !== 'completed' || cart.order?.evaluation ?  "d-none" : "nav-link"}
                        to={"/order/" + cart.order?.orderId + "/evaluate" }>
                    <Button
                      className="ms-2"
                      variant="info" >
                      <i className="bi bi-clipboard-check" />
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={ () => this.setState({ displayedCart: cart }) }>
                    <i className="bi bi-eye-fill" />
                  </Button>
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>

        {
          this.state.displayedCart !== null
            ? ( <CartPreview
              cart={ this.state.displayedCart }
              onClose={ () => this.setState({ displayedCart: null }) }
            /> )
            : ""
        }
      </>
    );
  }
}
