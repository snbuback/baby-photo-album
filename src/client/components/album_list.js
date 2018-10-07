import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import apiConfig from './app_config';
import AlbumCover from './album_cover';
import '../App.css';

class AlbumList extends Component {
    constructor(props) {
        super(props);
        this.state = { albums: [] };
    }

    componentDidMount() {
        apiConfig.getAlbums().then((albums) => this.setState({albums: albums}));
    }

    render() {
      return (
        <Row>
          <Col>
            <div className="d-flex flex-row flex-wrap">
                {this.state.albums.map((album, index) => 
                    <AlbumCover key={album.id} album={album} index={index} />
                )}
            </div>
          </Col>
        </Row>
      );
    }
  }

export default AlbumList;