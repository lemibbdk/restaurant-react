import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import CartModel from '../../models/CartModel';
import { Button, Card, Form, FormControl, InputGroup } from 'react-bootstrap';
import EventRegister from '../../api/EventRegister';
import CartService from '../../services/CartService';
import ItemService from '../../services/ItemService';
import { AppConfiguration } from '../../config/app.config';
import './CartPage.sass';
import React from 'react';
import ConfirmAction from '../Misc/ConfirmAction';
import TimePicker from 'react-time-picker';
import { getIdentity } from '../../api/api';
import UserService from '../../services/UserService';
import PostalAddressModel from '../../models/PostalAddressModel';
import { Redirect } from 'react-router-dom';

class CartPageProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string
    }
  }
}

interface CartPageState {
  cart: CartModel|null;

  showDeleteDialog: boolean;
  deleteDialogYesHandler: () => void;
  deleteDialogNoHandler: () => void;

  showMakeOrderDialog: boolean;
  makeOrderDialogYesHandler: () => void;
  makeOrderDialogNoHandler: () => void;

  userAddresses: PostalAddressModel[];
  selectedAddress: number,
  desiredTime: string;
  footnote: string;

  editing: boolean,

  desiredDeliveryDate: Date;
  errorText: string;

  redirectBackToOrders: boolean
}

export default class CartPage extends BasePage<CartPageProperties> {
  state: CartPageState;

  constructor(props: any) {
    super(props);

    const now = new Date();

    now.setMinutes(now.getMinutes() + 45);
    let minTime;

    let allowedMinutes = now.getMinutes() + '';
    let allowedHours = now.getHours() + '';

    if (Number(allowedMinutes) < 10) {
      allowedMinutes = '0' + allowedMinutes;
    }

    if (Number(allowedHours) < 10) {
      allowedHours = '0' + allowedHours;
    }

    minTime = allowedHours + ':' + allowedMinutes;

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

      userAddresses: [],
      selectedAddress: 0,
      desiredTime: minTime,
      footnote: '',

      editing: false,

      desiredDeliveryDate: now,

      errorText: '',

      redirectBackToOrders: false
    }
  }

  private getCartData() {
    CartService.getCart()
      .then(res => {
        if (!res) {
          return this.setState({
            errorText: 'Something wrong'
          })
        }

        this.setState({
          cart: res
        })
      })
  }

  private getUserData() {
    const userId = getIdentity('user');
    UserService.getById(+(userId))
      .then(res => {
        if (res === null) {
          return this.setState({errorText: 'Something wrong to get user data'})
        }

        this.setState({
          userAddresses: res.postalAddresses,
          selectedAddress: res.postalAddresses[0].postalAddressId
        });
      })
  }

  private getCartEditId(): number|null {
    const cid = this.props.match?.params.cid;

    return cid ? +(cid) : null;
  }

  private getEditCart() {
    CartService.getUserOrders()
      .then(res => {
        res.forEach(el => {
          if (el.cartId === this.getCartEditId()) {
            if (el.order?.status !== 'pending') return this.setState({errorText: "You can't edit this cart"})
            console.log(el)
            this.setState({
              cart: el,
              editing: true,
              footnote: el.order.footnote
            })
          }
        })
      })
  }

  componentDidMount() {
    this.getUserData();

    if (this.getCartEditId()) return this.getEditCart()

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

  private onDesiredTimeChange(e: any) {
    console.log(e)
    const now = new Date();
    const desiredHours = e === null ? '00' : Number(e.split(':')[0]);
    const desiredMinutes = e === null ? '00' : Number(e.split(':')[1]);

    const desired = new Date();
    desired.setHours(Number(desiredHours));
    desired.setMinutes(Number(desiredMinutes));

    if (desired.getTime() - now.getTime() < (45 * 60000)) {
      this.setState({
        errorText: 'Delivery time cen be at least in 45 minutes.'
      })
    } else {
      this.setState({
        errorText: ''
      })

      console.log(desired)
    }

    this.setState({
      desiredTime: e
    })
  }

  private updateFootnoteChange(field: 'footnote'): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value + ''
      })
    }
  }

  private makeOrderHandler() {
    if (this.state.cart === null) return;
    if (this.state.cart.itemInfos.length === 0) return;

    this.setState({
      showMakeOrderDialog: true,
      makeOrderDialogYesHandler: () => {
        CartService.makeOrder(this.state.desiredDeliveryDate, this.state.footnote, this.state.selectedAddress)
          .then(res => {
            if (!res.success) {
              this.setState({ errorText: res.message })
            }
          })
        this.setState({
          showMakeOrderDialog: false,
          cart: null
        });
      }
    });
  }

  private editOrderHandler() {
    if (this.state.cart === null) return;
    if (this.state.cart.itemInfos.length === 0) return;

    this.setState({
      showMakeOrderDialog: true,
      makeOrderDialogYesHandler: () => {
        if (this.state.cart && this.state.cart.order) {
          const data = {
            cartId: this.state.cart.cartId,
            itemInfos: this.state.cart.itemInfos,
            order: {
              orderId: this.state.cart.order.orderId,
              addressId: this.state.selectedAddress,
              desiredDeliveryTime: this.state.desiredDeliveryDate,
              footnote: this.state.footnote
            }
          }

          CartService.editCart(this.state.cart.cartId, data)
            .then(res => {
              console.log(res)
              if (!res.success) {
                return this.setState({
                  errorText: res.message
                })
              }
        this.setState({redirectBackToOrders: true})
            })
          this.setState({
            showMakeOrderDialog: false
          });
        }
      }
    });
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToOrders) {
      return ( <Redirect to="/order" /> );
    }

    if (this.state.cart === null || this.state.cart.itemInfos.length === 0) {
      return (
        <Card>
          <Card.Header>
            <Card.Title>
              <h1>Your shopping cart</h1>
            </Card.Title>
          </Card.Header>
          <Card.Body>

            {
              this.state.errorText === 'You can\'t edit this cart' ?
                <b>{this.state.errorText}</b>
                :
                <p>Your shopping cart is empty.</p>
            }


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
                        onChange={ this.onChangeQuantityInput(el.cartItemId) } />
                      <InputGroup.Append>
                        {
                          !this.state.editing ?
                            <Button variant="primary"
                                    onClick={ this.getUpdateQuantityHandler(el.cartItemId) }>
                              Update
                            </Button>
                            :
                            ""
                        }
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
              <tr>
                <td colSpan={3}>
                  <InputGroup className="h-100">
                    <InputGroup.Text>
                      Select delivery address
                    </InputGroup.Text>
                    <Form.Control
                      as="select"
                      value={ this.state.selectedAddress }
                      onChange={ this.setState }
                    >
                      {
                        this.state.userAddresses.map((el) => (
                          <option key={el.postalAddressId} value={el.postalAddressId}> { el.address } </option>
                        ))
                      }

                    </Form.Control>
                  </InputGroup>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <InputGroup className="h-100">
                    <InputGroup.Text>
                      Select desired delivery time
                    </InputGroup.Text>
                    <TimePicker
                      value={this.state.desiredTime}
                      // minTime={ this.getMinTime() }
                      maxTime="23:59"
                      onChange={(e) => this.onDesiredTimeChange(e)}
                    />
                  </InputGroup>
                  <span className="error-text">{this.state.errorText}</span>
                </td>
                <td colSpan={3}>
                  <InputGroup>
                    <InputGroup.Prepend className="d-flex">
                      <InputGroup.Text>Footnote</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      as="textarea"
                      aria-label="With textarea"
                      placeholder="Insert footnote here"
                      value={this.state.footnote}
                      onChange={this.updateFootnoteChange("footnote")}
                    />
                  </InputGroup>
                </td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <td colSpan={4}> </td>
                <td>
                  &euro; {
                  this.state.cart.itemInfos
                    .map(el => el.itemInfo.price * el.quantity)
                    .reduce((sum, value) => sum + value, 0)
                    .toFixed(2)
                }
                </td>
                <td>
                  {
                    this.state.cart.itemInfos.length > 0 && !this.state.editing ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={ () => this.makeOrderHandler() }
                        disabled={this.state.errorText.length > 0}
                      >
                        Make order
                      </Button>
                    ): this.state.cart.itemInfos.length > 0 && this.state.editing ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={ () => this.editOrderHandler() }
                        disabled={this.state.errorText.length > 0}
                      >
                        Submit
                      </Button>
                    ) : ""
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
