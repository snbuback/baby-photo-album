import React, { Component } from 'react';
import '../App.css';

class AlbumList extends Component {
    render() {
      return (
        <ul>
            {[...Array(5).keys()].map((i) => 
                (<li key={i}>rendering {i}</li>)
            )}
        </ul>
      );
    }
  }

export default AlbumList;