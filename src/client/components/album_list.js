import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import driver from '../api';
import AlbumCover from './album_cover';
import '../App.css';

class AlbumList extends Component {
    render() {
      return (
        <Row>
          <Col>
            <div className="d-flex flex-row flex-wrap">
                {driver.getAll().map((album, index) => 
                    <AlbumCover key={album.id} album={album} index={index} />
                )}
            </div>
          </Col>
        </Row>
      );
    }
  }

export default AlbumList;