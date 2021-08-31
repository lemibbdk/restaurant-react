import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CartLink from '../Cart/CartLink';
import './TopMenu.sass';

class TopMenuProperties {
  currentMenuType: "user" | "administrator" | "visitor" = "visitor";
}

export default class TopMenu extends React.Component<TopMenuProperties> {
  render() {
    if (this.props.currentMenuType === "visitor") {
      return (
        <Nav className="justify-content-center navigation">
          <Nav.Item>
            <Link className="nav-link" to="/">Home</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/user/login">User login</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/user/register">Register</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/administrator/login">Administrator login</Link>
          </Nav.Item>
        </Nav>
      );
    }

    if (this.props.currentMenuType === "administrator") {
      return (
        <Nav className="justify-content-center navigation">
          <Nav.Item>
            <Link className="nav-link" to="/dashboard/category">Categories</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/dashboard/item">Items</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/dashboard/user">Users</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/dashboard/order">Orders</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/dashboard/administrator">Administrators</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/administrator/logout">Logout</Link>
          </Nav.Item>
        </Nav>
      );
    }

    if (this.props.currentMenuType === "user") {
      return (
        <Nav className="justify-content-center navigation">
          <Nav.Item>
            <Link className="nav-link" to="/">Home</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/category">Categories</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/profile">My Profile</Link>
          </Nav.Item>

          <Nav.Item>
            <Link className="nav-link" to="/order">My Orders</Link>
          </Nav.Item>

          <CartLink />

          <Nav.Item>
            <Link className="nav-link" to="/user/logout">Logout</Link>
          </Nav.Item>
        </Nav>
      );
    }
  }
}
