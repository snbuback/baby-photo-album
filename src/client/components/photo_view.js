import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardImg, CardTitle, CardText } from 'reactstrap';
import PropTypes from 'prop-types';
import EditableText from './editable_text';
import apiConfig from './app_config';
import { Photo } from '../api/model';
import Promise from 'promise';
import '../App.css';


function updateComment(value) {
    return apiConfig.updatePhotoComment(this.props.photo, value).then(() => {
        console.info('Chamado comment valor', value, this.props);
        this.props.photo.comment = value;
        this.setState({});
    });
}

function updateTitle(value) {
    return apiConfig.updatePhotoTitle(this.props.photo, value).then(() => {
        console.info('Chamado com valor', value, this.props);
        this.props.photo.title = value;
        this.setState({});
    });
}

class SimplePhotoCard extends Component {
    base_width = 400;

    constructor(props) {
        super(props);
        this.updateComment = updateComment.bind(this);
        this.updateTitle = updateTitle.bind(this);
    }

    get width() {
        return this.base_width;
    }

    get height() {
        const photoHeight = this.props.photo.height;
        const photoWidth = this.props.photo.width;
        let height = Math.max(photoHeight && photoWidth ? (this.base_width / photoWidth * photoHeight) : 0, this.base_width);
        return height;
    }

    render() {
        return (
            <Card style={{width: `${this.width}px`}}>
                <CardImg src={this.props.photo.image} height={this.height} />
                <CardBody>
                    <CardTitle><EditableText text={this.props.photo.title} invitation={this.props.photo.id} updateFunc={this.updateTitle} /></CardTitle>
                    <CardText><EditableText text={this.props.photo.comment} updateFunc={this.updateComment} invitation='---' long /></CardText>
                </CardBody>
            </Card>
        );
    }

}

SimplePhotoCard.propTypes = {
    photo: PropTypes.instanceOf(Photo).isRequired
};

class PhotoView extends Component {
    base_height = 400;

    constructor(props) {
        super(props);
        this.updateComment = updateComment.bind(this);
        this.updateTitle = updateTitle.bind(this);
    }

    get dateTaken() {
        const date = this.props.photo.taken;
        return date ? `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}` : null;
    }

    get width() {
        const photoHeight = this.props.photo.height;
        const photoWidth = this.props.photo.width;
        const resizedWidth = Math.trunc(Math.max(photoHeight && photoWidth ? (this.base_height / photoHeight * photoWidth) : 0, this.base_height));
        // console.info('photoHeight=', photoHeight, 'photoWidth=', photoWidth, 'resizedWidth=', resizedWidth);
        return resizedWidth;
    }

    get height() {
        return this.base_height;
    }

    playElement() {
        if (this.props.photo.play) {
            return <video className="figure-img figure-video"
                        height={this.height}
                        width={this.width}
                        controls
                        poster={this.props.photo.url}
                    >
                <source src={this.props.photo.play} type={this.props.photo.mimeType} />
            </video>;
        }
        return <img key={this.props.photo.id} src={this.props.photo.image} className="figure-img" alt={this.props.photo.name} style={{height: `${this.height}px`}} />;
    }

    render() {
        return (
            <Col>
                <div className='card' style={{width: `${this.width}px`}}>
                    <figure className="figure">
                        {this.playElement()}
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
        Promise.all([
            // album
            apiConfig.getAlbums().then((albums) => albums.find((album) => album.id === this.props.match.params.albumId)),
            // photos
            apiConfig.getPhotos(this.props.match.params.albumId),
        ]).then((result) => {
            let album = result[0];
            let photos = result[1];
            this.setState({ photos: photos, album: album });
        });
    }

    isStory(photo) {
        return !!photo.comment;
    }

    render() {
        return (
            <div>
                <h3>{this.state.album.name}</h3>
                <Row className='row-photos'>
                    {this.state.photos.filter((photo => this.isStory(photo))).map((photo) =>
                        <PhotoView key={photo.id} photo={photo} />
                    )}
                </Row>
                <hr/>
                <h3>Veja toda a minha aventura</h3>
                <Row>
                    <div className="card-columns">
                    {this.state.photos.map((photo) =>
                        <SimplePhotoCard key={photo.id} photo={photo} />
                    )}
                    </div>
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