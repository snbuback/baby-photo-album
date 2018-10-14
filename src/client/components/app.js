import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { RingLoader } from 'react-spinners';
import { Route } from 'react-router-dom';
import appConfig from './app_config';
import AlbumList from "./album_list";
import PhotoListing from "./photo_listing";
import '../App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { granted: false };
    }

    componentDidMount() {
        // get authentication status
        appConfig.getAuthStatus((status) => this.setState({ granted: status }));
    }

    renderGranted() {
        return (
            <Container fluid>
                <Row className='row-title'>
                    <Col>
                        <h1 className='title'>Photo Album</h1>
                        <h2 className='sub-title'>The story of a little baby!</h2>
                    </Col>
                </Row>
                <Route exact path="/" component={AlbumList} />
                <Route path="/album/:albumId(.*)" component={PhotoListing} />
            </Container>
        );
    }

    renderDenied() {
        return (
            <div className='loading'>
                <p>Authenticating...</p>
                <RingLoader />
            </div>
        );
    }

    render() {
        return this.state.granted ? this.renderGranted() : this.renderDenied();
    }
}

export default App;
