/* global document */
import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import App from './components/app';
// import registerServiceWorker from './registerServiceWorker';

// disable back with two fingers
document.addEventListener(
    'mousewheel',
    (e) => {
        if (e.deltaX < 0) {
            let allow = false;
            for (const el of e.path) {
                if (el.scrollLeft > 0) {
                    allow = true;
                    break;
                }
            }
            if (!allow) {
                e.preventDefault();
            }
        }
    }
);

render((
    <Router hashType="noslash">
        <App></App>
    </Router>
), document.getElementById('root'));  // eslint: global: document

// TODO Enabled this in production
// registerServiceWorker();
