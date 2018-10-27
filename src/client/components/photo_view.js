import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import EditableText from './editable_text';
import apiConfig from './app_config';
import { Photo } from '../api/model';
import Promise from 'promise';
import '../App.css';

class PhotoView extends Component {
    height = 400;

    constructor(props) {
        super(props);
        this.updateComment = this.updateComment.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
    }

    updateComment(value) {
        return apiConfig.updatePhotoComment(this.props.photo, value).then(() => {
            this.props.photo.comment = value;
            this.setState({});
        });
    }

    updateTitle(value) {
        return apiConfig.updatePhotoTitle(this.props.photo, value).then(() => {
            this.props.photo.title = value;
            this.setState({});
        });
    }

    get dateTaken() {
        const date = this.props.photo.taken;
        return date ? `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}` : null;
    }

    get width() {
        return Math.max(this.props.photo.height && this.props.photo.width ? (this.height / this.props.photo.height * this.props.photo.width) : 0,
        400);
    }

    render() {
        return (
            <Col>
                <div className='card' style={{width: `${this.width}px`}}>
                    <figure className="figure">
                        <img key={this.props.photo.id} src={this.props.photo.image} className="figure-img" alt={this.props.photo.name} style={{height: `${this.height}px`}} />
                        <figcaption className='figure-caption'>
                            <EditableText text={this.props.photo.title} invitation={this.props.photo.id} updateFunc={this.updateTitle} />
                        </figcaption>
                        <p className='date-taken'>{this.dateTaken}</p>
                        <p className='figure-comment'>
                            <EditableText text={this.props.photo.comment} updateFunc={this.updateComment} invitation='' long />
                        </p>
                    </figure>
                </div>
            </Col>
        );
    }
}

PhotoView.propTypes = {
    photo: PropTypes.instanceOf(Photo).isRequired
    // index: PropTypes.number.isRequired
};

class PhotoListView extends Component {
    constructor(props) {
        super(props);
        this.state = { photos: [], album: {} };
    }

    componentDidMount() {
        console.info(`Requesting photo of path: "${this.props.match.params.albumId}"`);
        Promise.all([
            // album
            apiConfig.getAlbums().then((albums) => albums.find((album) => album.id === this.props.match.params.albumId)),
            // photos
            apiConfig.getPhotos(this.props.match.params.albumId),
        ]).then((result) => {
            let album = result[0];
            let photos = result[1];
            console.info('parameters', { photos: photos, album: album });
            this.setState({ photos: photos, album: album });
        });
    }

    render() {
        return (
            <div>
                <h3>{this.state.album.name}</h3>
                <Row className='row-photos'>
                    {this.state.photos.map((photo) =>
                        <PhotoView key={photo.id} photo={photo} />
                    )}
                </Row>
            </div>
        );
    }
}

PhotoListView.propTypes = {
    match: PropTypes.object.isRequired
};

export default PhotoListView;
export {PhotoListView, PhotoView};