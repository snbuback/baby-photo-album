import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Row, Col } from 'reactstrap';
import '../App.css';
import { Album } from '../api/model';

class AlbumCover extends Component {
    static propTypes = {
      album: PropTypes.instanceOf(Album).isRequired,
      index: PropTypes.number.isRequired
    };
  
    getStyle() {
      return this.props.album.image ? {
        backgroundImage: `url(${this.props.album.image})`
      } : {
        backgroundColor: '#495057'
      };
    }

    getClassName() {
        return `p-2 border d-flex album album-size-${this.props.index % 3 + 1}`;
    }
  
    render() {
      return <div className={this.getClassName()}>
            <h3 className="album-title">{this.props.album.name}</h3>
            <div className='album-cover' style={this.getStyle()}></div>
        </div>;
    }
  }
  
  export default AlbumCover;