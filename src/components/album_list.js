import React, { Component } from 'react';
import '../App.css';

class AlbumList extends Component {
    render() {
      return (
        <div>
          <h1>Photo Album</h1>
          <ul>
              {[...Array(5).keys()].map((i) => 
                  (<li key={i}>rendering {i}</li>)
              )}
          </ul>
        </div>
      );
    }
  }

export default AlbumList;