import React, { Component } from 'react';

class UI extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="ui">
        <div>Planet: {this.props.planet}</div>
        <div>Raynor Level: {this.props.level}</div>
        <div>Experience: {this.props.experience}</div>
        <div>Health: {this.props.health}</div>
        <div>Damage: {this.props.damage}</div>
        <div>Weapon: {this.props.weapon}</div>
        <div>Enemies Remaining: {this.props.enemies}</div>
        <div>Adjutant:</div>
        <div>{this.props.adjutant}</div>
      </div>
    )
  }
}

export default UI;
