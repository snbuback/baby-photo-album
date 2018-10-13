import React, { Component } from 'react';
// import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { RIEInput } from 'riek';
import appConfig from './app_config';
// import '../App.css';

class EditableText extends Component {
    constructor(props) {
        super(props);
        this.state = {'s': true};
    }

    get cssClasses() {
        return `editable ${this.props.text ? "editable-filled" : "editable-not-filled"}`;
    }

    get text() {
        return this.props.text || this.props.invitation;
    }

    get updateWrapper() {
        return (newState) => {
            console.info('Changing to', newState.text);
            this.props.updateFunc(newState.text).then(() => {
                console.info('Changed');
                this.setState({});
            });
        };
    }

    render() {
        return (
            <RIEInput value={this.text} propName='text' change={this.updateWrapper} className={this.cssClasses} />
        );
    }
}

EditableText.defaultProps = {
    invitation: "Express yourself!"
};

EditableText.propTypes = {
    text: PropTypes.string,
    invitation: PropTypes.string.isRequired,
    updateFunc: PropTypes.func.isRequired
};

export default EditableText;