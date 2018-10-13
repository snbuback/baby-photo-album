import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RIEInput } from 'riek';

class EditableText extends Component {
    constructor(props) {
        super(props);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    get cssClasses() {
        return `editable ${this.props.text ? "editable-filled" : "editable-not-filled"} ${this.props.className}`;
    }

    get text() {
        return this.props.text || this.props.invitation;
    }

    handleUpdate(newState) {
        this.props.updateFunc(newState.text);
    }

    render() {
        return (
            <RIEInput value={this.text} propName='text' change={this.handleUpdate} className={this.cssClasses} />
        );
    }
}

EditableText.defaultProps = {
    invitation: "Express yourself!"
};

EditableText.propTypes = {
    text: PropTypes.string,
    invitation: PropTypes.string.isRequired,
    updateFunc: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default EditableText;