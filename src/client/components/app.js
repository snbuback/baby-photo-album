import React, { Component } from 'react';
import '../App.css';
import AlbumList from "./album_list";
import { Container, Row, Col} from 'reactstrap';

class App extends Component {
  render() {
    return (
      <Container fluid>
        <Row>
          <Col>
            <h1 className="display-3">Photo Album</h1>
            <h2>The story of a little baby!</h2>
          </Col>
        </Row>
        <AlbumList />
      </Container>
    );
  }
}

export default App;
