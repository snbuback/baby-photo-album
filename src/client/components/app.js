import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { RingLoader } from 'react-spinners';
import appConfig from './app_config';
import AlbumList from "./album_list";
import '../App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { granted: false };
    }

    componentDidMount() {
        // get authentication status
        console.info('called;');
        appConfig.getAuthStatus((status) => this.setState({ granted: status }));
    }

    renderGranted() {
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
