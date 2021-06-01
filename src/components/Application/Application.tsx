import React from 'react';
import './Application.sass';
import { Container } from 'react-bootstrap';
import TopMenu from '../TopMenu/TopMenu';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from '../HomePage/HomePage';
import CategoryPage from '../CategoryPage/CategoryPage';
import ContactPage from '../ContactPage/ContactPage';

function Application() {
  return (
    <BrowserRouter>
      <Container className="Application">
        <div className="Application-header">
          Front-end aplikacije
        </div>
        <TopMenu />
        <div className="Application-body">
          <Switch>
            <Route exact path="/" component={HomePage} />

            <Route exact path="/category" component={CategoryPage} />

            <Route path="/contact">
              <ContactPage title="Our location in Belgrade" phone="+381 11 462 44 75" address="Sarajevska 14" />
            </Route>

            <Route path="/profile">
              My profile
            </Route>
          </Switch>
        </div>
        <div>
          &copy; 2021...
        </div>
      </Container>
    </BrowserRouter>
  );
}

export default Application;
