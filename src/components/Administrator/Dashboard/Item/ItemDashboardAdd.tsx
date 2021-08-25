import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import React from 'react';
import ItemService, { IAddItem } from '../../../../services/ItemService';
import EventRegister from '../../../../api/EventRegister';
import { isRoleLoggedIn } from '../../../../api/api';
import { Redirect } from 'react-router-dom';

class ItemDashboardAddProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string;
    }
  }
}

interface ItemDashboardAddState {
  name: string;
  ingredients: string;

  energyValueS: string;
  massS: string;
  priceS: string;

  energyValueL: string;
  massL: string;
  priceL: string;

  energyValueXL: string;
  massXL: string;
  priceXL: string;

  uploadFile: FileList | null;

  message: string;

  redirectBackToItems: boolean;
}

export default class ItemDashboardAdd extends BasePage<ItemDashboardAddProperties> {
  state: ItemDashboardAddState;

  constructor(props: any) {
    super(props);

    this.state = {
      name: '',
      ingredients: '',

      energyValueS: '',
      massS: '',
      priceS: '',

      energyValueL: '',
      massL: '',
      priceL: '',

      energyValueXL: '',
      massXL: '',
      priceXL: '',

      uploadFile: null,

      message: '',

      redirectBackToItems: false
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(loggedIn => {
        if (!loggedIn) return EventRegister.emit("AUTH_EVENT", "force_login");
      });
  }

  private getCategoryId(): number {
    return +(this.props.match?.params.cid ?? 0);
  }

  private onChangeInput(field: 'name' | 'ingredients' | 'energyValueS' | 'massS' | 'priceS' | 'energyValueL' | 'massL' |
    'priceL' | 'energyValueXL' | 'massXL' | 'priceXL'):
    (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.value
      })
    }
  }

  private onChangeFile(field: "uploadFile"): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.files
      });
    }
  }

  private handleAddButtonClick() {
    if (this.state.uploadFile === null) {
      return this.setState({
        message: "Could did not select a file to upload.",
      });
    }

    const data: IAddItem = {
      name: this.state.name,
      ingredients: this.state.ingredients,
      itemInfoAll: [
        {
          size: 'S',
          energyValue: +(this.state.energyValueS),
          mass: +(this.state.massS),
          price: +(this.state.priceS)
        },
        {
          size: 'L',
          energyValue: +(this.state.energyValueL),
          mass: +(this.state.massL),
          price: +(this.state.priceL)
        },
        {
          size: 'XL',
          energyValue: +(this.state.energyValueXL),
          mass: +(this.state.massXL),
          price: +(this.state.priceXL)
        }
      ],
      photos: [
        this.state.uploadFile.item(0) as File
      ],
      categoryId: this.getCategoryId()
    }

    ItemService.addNewItem(data)
      .then(res => {
        if (res.success) {
          this.setState({ redirectBackToItems: true })
        } else return this.setState({ message: res.message })
      })
  }

  renderMain(): JSX.Element {
    if (this.state.redirectBackToItems) {
      return ( <Redirect to="/dashboard/item" /> );
    }

    return (
      <>
        <Row>
          <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <b>Add new item</b>

                </Card.Title>
                <Card.Text as="div">
                  <Form>
                    <Form.Group>
                      <Form.Label>Name:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter item name"
                                    value={ this.state.name }
                                    onChange={ this.onChangeInput("name") }
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Ingredients:</Form.Label>
                      <Form.Control type="text"
                                    placeholder="Enter ingredients"
                                    value={ this.state.ingredients }
                                    onChange={ this.onChangeInput("ingredients") }
                      />
                    </Form.Group>

                    <Card>
                      <Card.Body>
                        <b>Size S</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueS }
                                        onChange={ this.onChangeInput("energyValueS") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massS }
                                        onChange={ this.onChangeInput("massS") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceS }
                                        onChange={ this.onChangeInput("priceS") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Body>
                        <b>Size L</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueL }
                                        onChange={ this.onChangeInput("energyValueL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massL }
                                        onChange={ this.onChangeInput("massL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceL }
                                        onChange={ this.onChangeInput("priceL") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Body>
                        <b>Size XL</b>
                        <Form.Group>
                          <Form.Label>Energy value:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter energy value"
                                        value={ this.state.energyValueXL }
                                        onChange={ this.onChangeInput("energyValueXL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Mass:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter mass"
                                        value={ this.state.massXL }
                                        onChange={ this.onChangeInput("massXL") }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Price:</Form.Label>
                          <Form.Control type="text"
                                        placeholder="Enter price"
                                        value={ this.state.priceXL }
                                        onChange={ this.onChangeInput("priceXL") }
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Form.Group>
                      <b>Item photo</b>
                      <Form.Label>Article photo:</Form.Label>
                      <Form.File
                        custom
                        data-browse="Select file"
                        accept=".png,.jpeg"
                        onChange={ this.onChangeFile("uploadFile") }/>
                    </Form.Group>


                    <Form.Group className="d-grid">
                      <Button variant="primary" className="mt-3"
                              onClick= { () => this.handleAddButtonClick() } >
                        Add
                      </Button>
                    </Form.Group>

                    {
                      this.state.message
                        ? (<p className="mt-3">{ this.state.message }</p>)
                        : ""
                    }
                  </Form>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

}
