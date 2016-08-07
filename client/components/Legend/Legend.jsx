import React, { Component } from 'react';

class Legend extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <span className="legend"><span className="tile raynor"></span>Jim Raynor</span>
        <span className="legend"><span className="tile health-pack"></span>Health Packs</span>
        <span className="legend"><span className="tile zerg"></span>Zerg</span>
        <span className="legend"><span className="tile weapon"></span>Weapon</span>
        <span className="legend"><span className="tile hyperion"></span>Hyperion</span>
        <span className="legend"><span className="tile kerrigan"></span>Sarah Kerrigan</span>
        <span className="legend">Adjust browser zoom if the map is not rendering properly.</span>
      </div>
    )
  }
}

export default Legend;
