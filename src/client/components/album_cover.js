import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
// import { Row, Col } from 'reactstrap';
import '../App.css';
import { Album } from '../api/model';

class AlbumCover extends Component {
    static propTypes = {
        album: PropTypes.instanceOf(Album).isRequired,
        index: PropTypes.number.isRequired
    };

    get albumStyle() {
        return this.props.album.image ?
            {
                backgroundImage: `url(${this.props.album.image})`
            } :
            {
                backgroundColor: '#495057'
            };
    }

    getClassName() {
        return `p-2 border d-flex album album-size-${(this.props.index+1) % 3 + 1}`;
    }

    get albumLink() {
        return `/album/${this.props.album.id}`;
    }

    render() {
        return (
            <div className={this.getClassName()}>
                <h3 className='album-title'><Link to={this.albumLink}>{this.props.album.name}</Link></h3>
                <div className='album-cover' style={this.albumStyle}></div>
            </div>
        );
    }
}

export default AlbumCover;