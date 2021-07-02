import BasePage from '../BasePage/BasePage';
import CartModel from '../../models/CartModel';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import EventRegister from '../../api/EventRegister';
import CartService from '../../services/CartService';
import ItemService from '../../services/ItemService';
import { AppConfiguration } from '../../config/app.config';
import './CartPage.sass';
import React from 'react';
import ConfirmAction from '../Misc/ConfirmAction';

interface CartPageState {
  cart: CartModel|null;

  showDeleteDialog: boolean;
  deleteDialogYesHandler: () => void;
  deleteDialogNoHandler: () => void;

  showMakeOrderDialog: boolean;
  makeOrderDialogYesHandler: () => void;
  makeOrderDialogNoHandler: () => void;
}

export default class CartPage extends BasePage<{}> {
  state: CartPageState;

  constructor(props: any) {
    super(props);

    this.state = {
      cart: null,

      showDeleteDialog: false,
      deleteDialogYesHandler: () => {},
      deleteDialogNoHandler: () => {
        this.setState({
          showDeleteDialog: false,
        })
      },

      showMakeOrderDialog: false,
      makeOrderDialogYesHandler: () => {},
      makeOrderDialogNoHandler: () => {
        this.setState({
          showMakeOrderDialog: false,
        })
      },
    }
  }

  private getCartData() {
    CartService.getCart()
      .then(res => {
        this.setState({
          cart: res
        })
      })
  }

  componentDidMount() {
    this.getCartData();
    EventRegister.on('CART_EVENT', this.getCartData.bind(this));
  }

  componentWillUnmount() {
    EventRegister.off('CART_EVENT', this.getCartData.bind(this));
  }

  private onChangeQuantityInput(cartItemId: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState((state: CartPageState) => {
        if (state.cart === null) {
          return state;
        }

        for (let i=0; i<state.cart.itemInfos.length; i++) {
          if (state.cart.itemInfos[i].cartItemId === cartItemId) {
            state.cart.itemInfos[i].quantity = Number(event.target.value);
            break;
          }
        }

        return state;
      });
    }
  }

  private getUpdateQuantityHandler(cartItemId: number): () => void {
    return () => {
      if (this.state.cart === null) return;

      for (let i=0; i<this.state.cart.itemInfos.length; i++) {
        if (this.state.cart.itemInfos[i].cartItemId === cartItemId) {
          CartService.setToCart(
            this.state.cart.itemInfos[i].itemInfoId,
            this.state.cart.itemInfos[i].quantity,
          );
          return;
        }
      }
    };
  }

  private getDeleteHandler(itemInfoId: number): () => void {
    return () => {
      this.setState({
        showDeleteDialog: true,
        deleteDialogYesHandler: () => {
          if (this.state.cart === null) {
            return this.setState({
              showDeleteDialog: false,
            });
          }

          for (let i=0; i<this.state.cart.itemInfos.length; i++) {
            if (this.state.cart.itemInfos[i].itemInfoId === itemInfoId) {
              CartService.setToCart(this.state.cart.itemInfos[i].itemInfoId, 0);
              return this.setState({
                showDeleteDialog: false,
              });
            }
          }
        }
      });
    };
  }

  private makeOrderHandler() {
    if (this.state.cart === null) return;
    if (this.state.cart.itemInfos.length === 0) return;

    this.setState({
      showMakeOrderDialog: true,
      makeOrderDialogYesHandler: () => {
        CartService.makeOrder();
        this.setState({ showMakeOrderDialog: false, });
      }
    });
  }

  renderMain(): JSX.Element {
    if (this.state.cart === null) {
      return (
        <Card>
          <Card.Header>
            <Card.Title>
              <h1>Your shopping cart</h1>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <p>Your shopping cart is empty.</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <>
        {
          this.state.showDeleteDialog ? (
            <ConfirmAction
              title="Remove from cart?"
              message="Are you sure that you want to remove this item from cart?"
              yesHandler={ this.state.deleteDialogYesHandler }
              noHandler={ this.state.deleteDialogNoHandler } />
          ): ""
        }

        {
          this.state.showMakeOrderDialog ? (
            <ConfirmAction
              title="Confirm sending order"
              message="Are you sure that you want to make this order?"
              yesHandler={ this.state.makeOrderDialogYesHandler }
              noHandler={ this.state.makeOrderDialogNoHandler } />
          ): ""
        }

        <Card>
          <Card.Header>
            <Card.Title>
              <h1>Your shopping cart</h1>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <table className="table table-sm cart-table">
              <thead>
              <tr>
                <th colSpan={2}>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Sum</th>
                <th>Options</th>
              </tr>
              </thead>
              <tbody>
              { this.state.cart.itemInfos.map(el => (
                <tr key={ "cart-item-" + el.itemInfoId }>
                  <td>
                    <img alt={ el.itemInfo.item?.name }
                         src={ ItemService.getThumbPath(AppConfiguration.API_URL + "/" + el.itemInfo.item?.photos[0].imagePath ) }
                         className="item-image" />
                  </td>
                  <td>
                    <b className="h5">{ el.itemInfo.item?.name }</b><br />
                    <small>({ el.itemInfo.item?.category?.name })</small>
                  </td>
                  <td>
                    &euro; { Number(el.itemInfo.price).toFixed(2) }
                  </td>
                  <td>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={ el.quantity }
                        onChange={ this.onChangeQuantityInput(el.itemInfoId) } />
                      <InputGroup.Append>
                        <Button variant="primary"
                                onClick={ this.getUpdateQuantityHandler(el.itemInfoId) }>
                          Update
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </td>
                  <td>
                    &euro; { Number(el.itemInfo.price * el.quantity).toFixed(2) }
                  </td>
                  <td>
                    <Button variant="danger"
                            onClick={ this.getDeleteHandler(el.itemInfoId) }>
                      Delete
                    </Button>
                  </td>
                </tr>
              )) }
              </tbody>
              <tfoot>
              <tr>
                <td colSpan={4}> </td>
                <td>
                  &euro; {
                  this.state
                    .cart
                    .itemInfos
                    .map(el => el.itemInfo.price * el.quantity)
                    .reduce((sum, value) => sum + value, 0)
                    .toFixed(2)
                }
                </td>
                <td>
                  {
                    this.state.cart.itemInfos.length > 0 ? (
                      <Button variant="primary" size="sm"
                              onClick={ () => this.makeOrderHandler() }>
                        Make order
                      </Button>
                    ): ""
                  }
                </td>
              </tr>
              </tfoot>
            </table>
          </Card.Body>
        </Card>
      </>
    )
  }
}
