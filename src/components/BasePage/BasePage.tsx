import React from 'react';
import { Row, Col } from 'react-bootstrap';

class BasePageProperties {
  sidebar?: JSX.Element = undefined;
}

export { BasePageProperties }

export default abstract class BasePage<Properties extends BasePageProperties> extends React.Component<Properties> {
  constructor(props: Properties) {
    super(props);
  }

  render() {
    const sidebarSizedOnMd = this.props.sidebar ? 3 : 0;
    const sidebarSizedOnLg = this.props.sidebar ? 3 : 0;

    return (
      <Row className="page-holder">
        <Col className="page-body" sm={ 12 } md={ 12 - sidebarSizedOnMd } lg={ 12 - sidebarSizedOnLg }>
          { this.renderMain() }
        </Col>
        <Col className="page-sidebar" sm={ 12 } md={ sidebarSizedOnMd } lg={ sidebarSizedOnLg }>
          { this.props.sidebar }
        </Col>
      </Row>
    )
  }

  abstract renderMain(): JSX.Element;
}
