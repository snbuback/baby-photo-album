import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import EditableText from './editable_text';
import apiConfig from './app_config';
import { Photo } from '../api/model';
import '../App.css';

class PhotoView extends Component {
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
        return date ? `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}` : null;
    }

    get styleSize() {
        const height = 400;
        const width = height / this.props.photo.height * this.props.photo.width;
        return {
            height: `${height}px`,
            width: `${width}px`
        };
    }

    render() {
        return (
            <Col>
                <div className='card'>
                    <figure className="figure">
                        <img key={this.props.photo.id} src={this.props.photo.image} className="figure-img" alt={this.props.photo.name} style={this.styleSize} />
                        <div className='d-flex'>
                            <figcaption className='p-2 flex-grow-1 figure-caption'>
                                <EditableText text={this.props.photo.title} invitation={this.props.photo.id} updateFunc={this.updateTitle} />
                            </figcaption>
                            <p className='p-2 date-taken'>{this.dateTaken}</p>
                        </div>
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
        this.state = { photos: [] };
    }

    componentDidMount() {
        console.info(`Requesting photo of path: "${this.props.match.params.albumId}"`);
        apiConfig.getPhotos(this.props.match.params.albumId).then((photos) => this.setState({ photos: photos }));
    }

    render() {
        return (
            <Row className='row-photos'>
                {this.state.photos.map((photo) =>
                    <PhotoView key={photo.id} photo={photo} />
                )}
            </Row>
        );
    }
}

PhotoListView.propTypes = {
    match: PropTypes.object.isRequired
};

export default PhotoListView;
export {PhotoListView, PhotoView};