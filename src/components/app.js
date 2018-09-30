import React, { Component } from 'react';
import '../App.css';
import AlbumList from "./album_list";
import { Container, Row, Col } from 'reactstrap';

class App extends Component {
  render() {
    return (
      <Container fluid>
        <Row>
          <Col>.col</Col>
        </Row>
        <Row>
          <Col>.col</Col>
          <Col>.col</Col>
          <Col>.col</Col>
          <Col>.col</Col>
        </Row>
        <Row>
          <Col>
            <AlbumList />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
