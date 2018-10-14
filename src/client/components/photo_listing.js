import React, { Component } from 'react';
import { Row, Col, Container } from 'reactstrap';
import apiConfig from './app_config';
import { Photo } from '../api/model';
import PropTypes from 'prop-types';
import '../App.css';
import EditableText from './editable_text';

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

    render() {
        return (
            <Col>
                <div className='card photo'>
                    <figure className="figure ">
                        <img key={this.props.photo.id} src={this.props.photo.image} className="figure-img img-fluid rounded" alt={this.props.photo.name} />
                        <figcaption className="figure-caption">
                            <EditableText text={this.props.photo.title} invitation={this.props.photo.id} updateFunc={this.updateTitle} />
                        </figcaption>
                        <p>
                            <EditableText text={this.props.photo.comment} updateFunc={this.updateComment} />
                        </p>
                        <small>{this.dateTaken}</small>
                        
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

class PhotoListing extends Component {
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
            <Row>
                <Col xs="12">
                    <Container fluid className='container-column'>
                        <Row className='flex-row flex-nowrap'>
                            {this.state.photos.map((photo) =>
                                <PhotoView key={photo.id} photo={photo} />
                            )}
                        </Row>
                    </Container>
                </Col>
            </Row>
        );
    }
}

PhotoListing.propTypes = {
    match: PropTypes.object.isRequired
};

export default PhotoListing;