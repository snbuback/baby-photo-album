import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import apiConfig from './app_config';
import { Album } from '../api/model';
import '../App.css';


class AlbumView extends Component {
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
        return `album-cover album-size-${(this.props.index+1) % 3 + 1}`;
    }

    get albumLink() {
        return `/album/${this.props.album.id}`;
    }

    render() {
        return (
            <div className={this.getClassName()}>
                <h3 className='album-title'><Link to={this.albumLink}>{this.props.album.name}</Link></h3>
                <div className='album-photo' style={this.albumStyle}></div>
            </div>
        );
    }
}

class AlbumListView extends Component {
    constructor(props) {
        super(props);
        this.state = { albums: [] };
    }

    componentDidMount() {
        apiConfig.getAlbums().then((albums) => this.setState({albums: albums}));
    }

    render() {
      return (
        <div className="album-list">
            {this.state.albums.map((album, index) => 
                <AlbumView key={album.id} album={album} index={index} />
            )}
        </div>
      );
    }
  }

export default AlbumListView;
export {AlbumListView, AlbumView};