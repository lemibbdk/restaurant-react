import BasePage from '../../../BasePage/BasePage';
import AdministratorModel from '../../../../models/AdministratorModel';
import React from 'react';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import AdministratorService from '../../../../services/AdministratorService';

interface AdministratorDashboardListState {
  administrators: AdministratorModel[];
  message: string;
}

export default class AdministratorDashboardList extends BasePage<{}> {
  state: AdministratorDashboardListState;

  constructor(props: any) {
    super(props);

    this.state = {
      administrators: [],
      message: ''
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(result => {
        if (!result) return EventRegister.emit('AUTH_EVENT', 'force_login');
      })

    this.loadAdministrators();
  }

  private loadAdministrators() {
    AdministratorService.getAdministrators()
      .then(res => {
        this.setState({ administrators: res })
      })
  }

  renderMain(): JSX.Element {
    return (
      <>
        <h1>Administrators</h1>
        <table className="table table-sm">
          <thead>
          <tr>
            <th>Username</th>
            <th>#ID</th>
            <th>Active</th>
          </tr>
          </thead>
          <tbody>
          {
            this.state.administrators.map(el => (
              <tr key={"user-" + el.administratorId}>
                <td> { el.username } </td>
                <td>{ el.administratorId }</td>
                <td>{ el.isActive ? 'True' : 'Else' }</td>
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
