import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import apiConfig from './app_config';
import { Photo } from '../api/model';
import PropTypes from 'prop-types';
import '../App.css';
import EditableText from './editable_text';

class PhotoView extends Component {
    constructor(props) {
        super(props);
        this.updateComment = this.updateComment.bind(this);
    }

    updateComment(value) {
        return apiConfig.updatePhoto(this.props.photo, value).then(() => {
            this.props.photo.comment = value;
            this.setState({});
        });
    }

    render() {
        return (
            <div>
                <figure className="figure photo">
                    <img key={this.props.photo.id} src={this.props.photo.image} className="figure-img img-fluid rounded" alt={this.props.photo.name} />
                    <figcaption className="figure-caption">{this.props.photo.name}</figcaption>
                    <EditableText text={this.props.photo.comment} updateFunc={this.updateComment} />
                </figure>
            </div>
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
                <Col>
                    <div className="">
                        {this.state.photos.map((photo) =>
                            <PhotoView key={photo.id} photo={photo} />
                        )}
                    </div>
                </Col>
            </Row>
        );
    }
}

PhotoListing.propTypes = {
    match: PropTypes.object.isRequired
};

export default PhotoListing;