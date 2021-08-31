import BasePage from '../../../BasePage/BasePage';
import React from 'react';
import UserModel from '../../../../models/UserModel';
import EventRegister from '../../../../api/EventRegister';
import { isRoleLoggedIn } from '../../../../api/api';
import UserService from '../../../../services/UserService';
import CartService from '../../../../services/CartService';
import CartModel from '../../../../models/CartModel';
import { Button } from 'react-bootstrap';

interface UserDashboardListState {
  users: UserModel[];
  completedOrdersByUserId: {},
  ordersCounter: {[key: number]: number};
  message: string;
}

export default class UserDashboardList extends BasePage<{}> {
  state: UserDashboardListState;

  constructor(props: any) {
    super(props);

    this.state = {
      users: [],
      completedOrdersByUserId: {},
      ordersCounter: {},
      message: ''
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) return EventRegister.emit('AUTH_EVENT', 'force_login');
      })

    this.loadUsers();
  }

  private loadUsers() {
    UserService.getUsers()
      .then(res => {
        res ? this.setState({users: res}) : this.setState({message: 'Something wrong'})

        this.loadOrders()
      })
  }

  private loadOrders() {
    CartService.getAllOrders()
      .then(res => {
        if (!res) {
          return this.setState({message: 'Something wrong with loading user orders'});
        }

        res.forEach((el: CartModel) => {
          if (el.order && el.order.status === "completed") {
            if (this.state.ordersCounter[el.userId] === undefined) {
              this.setState({ordersCounter: { [el.userId]: 0 }})
            }
            this.setState({ordersCounter: {
                [el.userId]: ++this.state.ordersCounter[el.userId]
              }})
          }
        })
      })
  }

  private deleteButtonHandler(userId: number) {
    UserService.delete(userId)
      .then(res => {
        this.loadUsers();
      })
  }

  renderMain(): JSX.Element {
    return (
      <>
        <h1>Users</h1>
        <table className="table table-sm">
          <thead>
          <tr>
            <th>email</th>
            <th>#ID</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Active</th>
            <th>Orders Completed</th>
            <th>Options</th>
          </tr>
          </thead>
          <tbody>
          {
            this.state.users.map(el => (
              <tr key={"user-" + el.userId}>
                <td> { el.email } </td>
                <td>{ el.userId }</td>
                <td>{ el.forename }</td>
                <td>{ el.surname }</td>
                <td>{ el.isActive ? 'True' : 'Else' }</td>
                <td> {this.state.ordersCounter[el.userId] ? this.state.ordersCounter[el.userId] : '0'} </td>
                <td>
                  <Button variant='danger' onClick={() => this.deleteButtonHandler(el.userId)}>Delete</Button>
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>
        {
          this.state.message
        }
      </>
    );
  }
}
