import React, { Component } from 'react';

class Tile extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return ( <span className={this.props.style.join(" ")}></span> );
  }
}

export default Tile;
