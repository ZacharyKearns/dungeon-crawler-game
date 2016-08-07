import React, { Component } from 'react';

class Links extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="links">
        <div>Source Code:<a
        href="https://github.com/ZacharyKearns/dungeon-crawler-game"
        target="_blank">https://github.com/ZacharyKearns/dungeon-crawler-game</a></div>
        <div>Map Generation:<a
        href="http://gamedevelopment.tutsplus.com/tutorials/create-a-procedurally-generated-dungeon-cave-system--gamedev-10099"
        target="_blank">http://gamedevelopment.tutsplus.com/tutorials/create-a-procedurally-generated-dungeon-cave-system--gamedev-10099</a></div>
        <div>Boilerplate:<a
        href="https://github.com/srn/react-webpack-boilerplate"
        target="_blank">https://github.com/srn/react-webpack-boilerplate</a></div>
      </div>
    )
  }
}

export default Links;
