import BasePage, { BasePageProperties } from '../../../BasePage/BasePage';
import { ItemPhoto } from '../../../../models/ItemModel';
import { isRoleLoggedIn } from '../../../../api/api';
import EventRegister from '../../../../api/EventRegister';
import ItemService from '../../../../services/ItemService';
import { AppConfiguration } from '../../../../config/app.config';
import { Button, Form } from 'react-bootstrap';
import React from 'react';

class ItemDashboardPhotoEditProperties extends BasePageProperties {
  match?: {
    params: {
      cid: string;
      iid: string;
    }
  }
}

interface ItemDashboardPhotoEditState {
  photos: ItemPhoto[];
  selectedPhotosToDelete: [];
  uploadFile: FileList | null,
  fileInput: string;
  message: string;
  redirectBackToItems: boolean;
}

export default class ItemDashboardPhotoEdit extends BasePage<ItemDashboardPhotoEditProperties> {
  state: ItemDashboardPhotoEditState;

  constructor(props: any) {
    super(props);

    this.state = {
      photos: [],
      selectedPhotosToDelete: [],
      uploadFile: null,
      fileInput: '',
      message: '',
      redirectBackToItems: false
    }
  }

  componentDidMount() {
    isRoleLoggedIn('administrator')
      .then(loggedIn => {
        if (!loggedIn) return EventRegister.emit("AUTH_EVENT", "force_login");
      });

    this.getItem();
  }

  private getItemId() {
    return +(this.props.match?.params.iid ?? 0);
  }

  private getItem() {
    ItemService.getItemById(this.getItemId(), 'administrator')
      .then(res => {
        if (res === null) {
          return this.setState({
            message: 'Item not found',
            redirectBackToItems: true
          })
        }

        this.setState({ photos: res.photos })
      })
  }

  private handlePhotoCheck(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      this.setState({ selectedPhotosToDelete: [...this.state.selectedPhotosToDelete, +(e.target.value)] })
    } else {
      this.setState({ selectedPhotosToDelete: this.state.selectedPhotosToDelete.filter(el => el !== +(e.target.value)) })
    }
  }

  private handleDeletePhotosButton() {
    if (this.state.selectedPhotosToDelete.length === 0) {
      return  this.setState({ message: 'You must select at least one photo' })
    }

    ItemService.deletePhotos(this.getItemId(), this.state.selectedPhotosToDelete)
      .then(res => {
        if (res.success) {
          console.log(res);
          this.setState({selectedPhotosToDelete: []})
          this.getItem();
        } else {
          this.setState({ message: res.message })
        }
      })
  }

  private handleUploadPhotos() {
    if (this.state.uploadFile === null) {
      return this.setState({
        message: "Could did not select a file to upload.",
      });
    }

    ItemService.addPhotos(this.getItemId(), this.state.uploadFile)
      .then(res => {
        if (res.success) {
          this.setState({uploadFile: null});
          const target = document.getElementById("fileControl") as HTMLInputElement;
          target.value = "";
          this.getItem();
        } else return this.setState({ message: res.message })
      })
  }

  private onChangeFile(field: "uploadFile"): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        [field]: event.target.files
      });
    }
  }

  renderMain(): JSX.Element {
    return (
      <>
        <div className="d-flex flex-wrap">
          {this.state.photos.map(el => (
            <div key={el.photoId} className="m-2">
              <img alt={ '' + el.photoId }
                   src={ ItemService.getThumbPath(AppConfiguration.API_URL + "/" + el.imagePath ) }
                   className="item-image"
                   width={250}/>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check to delete" value={el.photoId} onChange={ (e) => this.handlePhotoCheck(e) } />
              </Form.Group>
            </div>
          ))}
        </div>

        <div>
          <Button variant="danger" className="mt-3"
                  onClick= { () => this.handleDeletePhotosButton() } >
            Delete Selected
          </Button>
        </div>
        <div>
          <Form.Group>
            <Form.Label>Upload photos:</Form.Label>
            <Form.Control
              type="file"
              multiple
              id="fileControl"
              custom
              data-browse="Select file"
              accept=".png,.jpeg,.jpg"
              onChange={ this.onChangeFile("uploadFile") }  />
          </Form.Group>
          <Button variant="primary" className="mt-3"
                  onClick= { () => this.handleUploadPhotos() } >
            Upload selected
          </Button>
        </div>

        {
          this.state.message
            ? (<p className="mt-3">{ this.state.message }</p>)
            : ""
        }
      </>
    );
  }
}
