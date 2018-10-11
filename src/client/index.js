/* global document */
import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from './components/app';
// import registerServiceWorker from './registerServiceWorker';

render((
    <Router hashType="noslash">
        <App></App>
    </Router>
), document.getElementById('root'));  // eslint: global: document

// TODO Enabled this in production
// registerServiceWorker();
