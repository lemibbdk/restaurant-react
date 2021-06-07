import ItemModel from '../../models/ItemModel';
import { AppConfiguration } from '../../config/app.config';
import * as path from 'path';
import { Card, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface ItemProperties {
  item: ItemModel;
}

function getThumbPath(url: string): string {
  const directory = path.dirname(url);
  const extension = path.extname(url);
  const filename  = path.basename(url, extension);
  return directory + "/" + filename + "-thumb" + extension;
}

export default function Item(props: ItemProperties) {
  return (
    <Col xs={ 12 } sm={ 6 } md={ 4 } lg={ 3 } className="mt-3">
      <Card>
        <Link to={ '/item/' + props.item.itemId }>
          <Card.Img variant='top' src={ getThumbPath(AppConfiguration.API_URL + '/' + props.item.photos[0]?.imagePath) } />
        </Link>
        <Card.Body>
          <Card.Title>
            <Link to={ '/item/' + props.item.itemId }>
              { props.item.name }
            </Link>
          </Card.Title>
          <Card.Text as="div">
            { props.item.ingredients }
          </Card.Text>
          <Card.Text as="div">
            <b>&euro; { props.item.itemInfoAll[0].price.toFixed(2) }</b>
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}
