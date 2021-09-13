import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import ItemModel from '../../models/ItemModel';
import ItemService from '../../services/ItemService';
import {Link} from 'react-router-dom';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import React from 'react';
import CartService from '../../services/CartService';
import { AppConfiguration } from '../../config/app.config';
import ImageGallery from 'react-image-gallery';
import './ItemPage.sass'

class ItemPageProperties extends BasePageProperties {
  match?: {
    params: {
      iid: string;
    }
  }
}

class ItemPageState {
  data: ItemModel|null = null;
  quantity: string[] = [];
}

interface GalleryItem {
  original: string,
  thumbnail: string
}

export default class ItemPage extends BasePage<ItemPageProperties> {
  state: ItemPageState;

  constructor(props: ItemPageProperties) {
    super(props);


    this.state = {
      data: null,
      quantity: ['1', '1', '1']
    }
  }

  private getItemId(): number {
    return Number(this.props.match?.params.iid);
  }

  private getItemData() {
    ItemService.getItemById(this.getItemId())
      .then(res => {
        this.setState({
          data: res
        })
      })
  }

  componentDidMount() {
    this.getItemData();
  }

  componentDidUpdate(prevProps: Readonly<ItemPageProperties>, prevState: Readonly<{}>) {
    if (prevProps.match?.params.iid !== this.props.match?.params.iid) {
      this.getItemData();
    }
  }

  private onChangeInput(field: 'quantity', i: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuantities = [...this.state.quantity];
      newQuantities[i] = event.target.value;
      this.setState({
        [field]: newQuantities
      });
    }
  }

  private addToCart(itemInfoId: number, i: number) {
    CartService.addToCart(itemInfoId, Number(this.state.quantity[i]))
  }

  renderMain(): JSX.Element {
    if (this.state.data === null) {
      return (
        <>
          <h1>Item not found.</h1>
        </>
      );
    }

    const item = this.state.data as ItemModel;

    const images: GalleryItem[] = [];
    item.photos.forEach(el => {
      images.push({
        original: AppConfiguration.API_URL + '/' + el.imagePath,
        thumbnail: ItemService.getThumbPath(AppConfiguration.API_URL + '/' + el.imagePath)
      })
    })

    return (
      <>
        <div>
          <h1>
            <Link to={ "/category/" + item.categoryId }>
              <Button variant="info">
                &lt; Back
              </Button>
            </Link>
          </h1>
          <h1 className="text-center">{item.name}</h1>
        </div>

        <p className="text-center">{item.ingredients}</p>

        <Row>
          <Col sm={12} lg={5}>
            <ImageGallery items={images} />
          </Col>
          <Col xs={ 12 } lg={ 7 }>
            <Card className="m-2 border-0">
              <Card.Body>
                <Card.Text as="div">
                  {
                    item.itemInfoAll.map((itemInfo, i) => (
                      <Card key={ "item-info-" + itemInfo.itemInfoId } className="mb-3">
                        <Card.Body>
                          <Row>
                            <Col xs={ 6 } md={ 2 }>
                              <strong> Size: {itemInfo.size} </strong>
                            </Col>
                            <Col xs={ 6 } md={ 2 }>
                              <strong> En.v. : {itemInfo.energyValue} </strong>
                            </Col>
                            <Col xs={ 6 } md={ 2 }>
                              <strong> Mass: {itemInfo.mass} </strong>
                            </Col>
                            <Col xs={ 6 } md={ 3 }>
                              <strong className="h1">
                                &euro; { itemInfo.price.toFixed(2) }
                              </strong>
                            </Col>
                            <Col xs={ 12 } md={ 3 }>
                              <Card className="border-0">
                                <Card.Body>
                                  <Card.Title>
                                    <b>Add to cart</b>
                                  </Card.Title>
                                  <Card.Text as="div">
                                    <InputGroup>
                                      <InputGroup.Prepend>
                                        <InputGroup.Text>Quantity:</InputGroup.Text>
                                      </InputGroup.Prepend>
                                      <Form.Control
                                        type="number"
                                        className="w-auto"
                                        min="1"
                                        max="100"
                                        step="1"
                                        value={ this.state.quantity[i] }
                                        onChange={ this.onChangeInput("quantity", i) } />
                                      <InputGroup.Append>
                                        <Button
                                          variant="primary"
                                          onClick={ () => this.addToCart(itemInfo.itemInfoId, i) }>
                                          Add
                                        </Button>
                                      </InputGroup.Append>
                                    </InputGroup>
                                  </Card.Text>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  }

                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </>
    );
  }

}
