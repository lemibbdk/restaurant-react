import React from 'react';
import './Application.sass';
import { Container } from 'react-bootstrap';
import TopMenu from '../TopMenu/TopMenu';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from '../HomePage/HomePage';
import CategoryPage from '../CategoryPage/CategoryPage';
import ContactPage from '../ContactPage/ContactPage';
import EventRegister from '../../api/EventRegister';
import api from '../../api/api';
import UserLogin from '../User/UserLogin';
import UserLogout from '../User/UserLogout';
import ItemPage from '../Item/ItemPage';
import UserRegistration from '../User/UserRegistration';
import AdministratorLogin from '../Administrator/AdministratorLogin';
import AdministratorLogout from '../Administrator/AdministratorLogout';
import CategoryDashboardList from '../Administrator/Dashboard/Category/CategoryDashboardList';
import CategoryDashboardAdd from '../Administrator/Dashboard/Category/CategoryDashboardAdd';
import CategoryDashboardEdit from '../Administrator/Dashboard/Category/CategoryDashboardEdit';
import CartPage from '../Cart/CartPage';
import OrderDashboardList from '../Administrator/Dashboard/Order/OrderDashboardList';
import ItemDashboardList from '../Administrator/Dashboard/Item/ItemDashboardList';
import ItemDashboardAdd from '../Administrator/Dashboard/Item/ItemDashboardAdd';

class ApplicationState {
  authorizedRole: "user" | "administrator" | "visitor" = "visitor";
}

export default class Application extends React.Component {
  state: ApplicationState;

  constructor(props: any) {
    super(props);

    this.state = {
      authorizedRole: 'visitor'
    }
  }

  componentDidMount() {
    EventRegister.on("AUTH_EVENT", this.authEventHandler.bind(this));

    this.checkRole("user");
    this.checkRole("administrator");
  }

  componentWillUnmount() {
    EventRegister.off("AUTH_EVENT", this.authEventHandler.bind(this));
  }

  private authEventHandler(message: string) {
    console.log('Application: authEventHandler: ', message);

    if (message === "force_login" || message === "user_logout" || message === "administrator_logout") {
      return this.setState({ authorizedRole: "visitor" });
    }

    if (message === "user_login") {
      return this.setState({ authorizedRole: "user" });
    }

    if (message === "administrator_login") {
      return this.setState({ authorizedRole: "administrator" });
    }
  }

  private checkRole(role: "user" | "administrator") {
    api("GET", "/auth/" + role + "/ok", role)
      .then(res => {
        if (res?.data === "OK") {
          this.setState({
            authorizedRole: role,
          });
          EventRegister.emit("AUTH_EVENT", role + "_login");
        }
      })
      .catch(() => {});
  }

  render() {
    return (
      <BrowserRouter>
        <Container className="Application">
          <div className="Application-header">
            Front-end aplikacije
          </div>
          <TopMenu currentMenuType={ this.state.authorizedRole } />
          <div className="Application-body">
            <Switch>
              <Route exact path="/" component={ HomePage } />

              <Route path="/category/:cid?"
                     render={
                       (props: any) => {
                         return (
                           <CategoryPage { ...props } />
                         )
                       }
                     }
              />

              <Route path="/item/:iid" component={ItemPage} />

              <Route path="/contact">
                <ContactPage title="Our location in Belgrade" phone="+381 11 462 44 75" address="Sarajevska 14" />
              </Route>

              <Route path="/profile">
                My profile
              </Route>

              <Route path="/user/register" component={UserRegistration} />
              <Route path="/user/login" component={UserLogin} />
              <Route path="/user/logout" component={UserLogout} />
              <Route exact path="/cart" component={CartPage} />

              <Route path="/administrator/login" component={AdministratorLogin} />
              <Route path="/administrator/logout" component={AdministratorLogout} />

              <Route exact path="/dashboard/category" component={CategoryDashboardList} />
              <Route exact path="/dashboard/category/add" component={CategoryDashboardAdd} />
              <Route path="/dashboard/category/edit/:cid" component={CategoryDashboardEdit} />
              <Route exact path="/dashboard/order" component={OrderDashboardList} />
              <Route exact path="/dashboard/item" component={ItemDashboardList} />
              <Route exact path="/dashboard/:cid/item/add" component={ItemDashboardAdd} />
            </Switch>
          </div>
          <div>
            &copy; 2021...
          </div>
        </Container>
      </BrowserRouter>
    );
  }
}
