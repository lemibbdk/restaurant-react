import BasePage from '../../../BasePage/BasePage';
import CartModel, { OrderStatus } from '../../../../models/CartModel';
import CartService from '../../../../services/CartService';
import { Button, Form, InputGroup } from 'react-bootstrap';
import EventRegister from '../../../../api/EventRegister';
import React from 'react';
import CartPreview from './CartPreview';
import { isRoleLoggedIn } from '../../../../api/api';

interface OrderDashboardListState {
  carts: CartModel[];
  cartStatusSaveButtonEnabled: Map<number, boolean>;
  displayedCart: CartModel | null;
}

export default class OrderDashboardList extends BasePage<{}> {
  state: OrderDashboardListState;
  wrapper: React.RefObject<any>;
  constructor(props: any) {
    super(props);

    this.wrapper = React.createRef();

    this.state = {
      carts: [],
      cartStatusSaveButtonEnabled: new Map(),
      displayedCart: null
    }
  }

  private getOrders() {
    CartService.getAllOrders()
      .then(res => {
        this.setState({
          carts: res
        })
      })
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) return EventRegister.emit('AUTH_EVENT', 'force_login');
      })

    this.getOrders();

    EventRegister.on("ORDER_EVENT", this.getOrders.bind(this));
  }

  componentWillUnmount() {
    EventRegister.off("ORDER_EVENT", this.getOrders.bind(this));
  }

  getLocalDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  private getChangeOrderStatusHandler(cartId: number): (event: React.ChangeEvent<HTMLSelectElement>) => void {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = event.target?.value + "";

      this.setState((state: OrderDashboardListState) => {
        state.cartStatusSaveButtonEnabled.set(cartId, true);

        for (let cart of state.carts) {
          if (cart.cartId === cartId && cart.order) {
            cart.order.status = newStatus as OrderStatus;
            break;
          }
        }

        return state;
      });
    }
  }

  private setNewOrderStatus(cartId: number) {
    const status = this.state.carts.find(c => c.cartId === cartId)?.order?.status as OrderStatus;
    CartService.setOrderStatus(cartId, status, 'administrator');

    this.setState((state:OrderDashboardListState) => {
      state.cartStatusSaveButtonEnabled.set(cartId, false);

      return state;
    })
  }

  renderMain(): JSX.Element {
    return (
      <>
        <div>
          <h1 className="text-center">All Orders</h1>
        </div>

        <table className="table table-sm">
          <thead>
          <tr>
            <th>#ID</th>
            <th>Date and Time</th>
            <th>Total price</th>
            <th>User</th>
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
                <td>{ cart.user.email }</td>
                <td>
                  <InputGroup>
                    <Form.Control
                      as="select"
                      value={ cart.order?.status }
                      onChange={ this.getChangeOrderStatusHandler(cart.cartId) }
                    >
                      <option value="pending">Pending</option>
                      <option value="rejected">rejected</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                    </Form.Control>
                    <InputGroup.Append>
                      <Button
                        disabled={ !this.state.cartStatusSaveButtonEnabled.get(cart.cartId) }
                        variant="primary"
                        onClick={() => this.setNewOrderStatus(cart.cartId)} >
                        Set status
                      </Button>
                    </InputGroup.Append>
                  </InputGroup>
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={ () => this.setState({ displayedCart: cart }) }>
                    Show cart
                  </Button>
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>

        <div ref={this.wrapper}>
          {
            this.state.displayedCart !== null
              ? ( <CartPreview
                ref={this.wrapper}
                cart={ this.state.displayedCart }
                onClose={ () => this.setState({ displayedCart: null }) }
              /> )
              : ""
          }
        </div>

      </>
    );
  }
}
