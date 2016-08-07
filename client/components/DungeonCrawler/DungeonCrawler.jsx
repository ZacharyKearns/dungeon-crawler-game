import React, { Component } from 'react';
import Tile from '../Tile/Tile';
import UI from '../UI/UI';
import Legend from '../Legend/Legend';
import Links from '../Links/Links';
import { throttle, findIndex } from 'lodash';

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function Room(x, y, width, height) {
  this.x1 = x;
  this.x2 = x + width;
  this.y1 = y;
  this.y2 = y + height;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.center = new Point(Math.floor((this.x1 + this.x2) / 2), Math.floor((this.y1 + this.y2) / 2));
  this.intersects = function(room) {
    return (this.x1 <= room.x2 && this.x2 >= room.x1 && this.y1 <= room.y2 && room.y2 >= room.y1);
  };
}

const planets = [
  {
    name: "Mar Sara",
    wall: "planet1-wall",
    room: "planet-room",
    corridor: "planet-corridor",
    weapon: "C-14 rifle",
    zerg: ["Zergling", "Baneling", "Spine Crawler"]
  },
  {
    name: "Char",
    wall: "planet2-wall",
    room: "planet-room",
    corridor: "planet-corridor",
    weapon: "Hellfire shotgun",
    zerg: ["Roach", "Hydralisk", "Mutalisk"]
  },
  {
    name: "Ulaan",
    wall: "planet3-wall",
    room: "planet-room",
    corridor: "planet-corridor",
    weapon: "Quad K12 grenade launcher",
    zerg: ["Ultralisk", "Brood Lord", "Infestor"]
  }
];

class DungeonCrawler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlanet: planets[0],
      map: this.createMap(planets[0]),
      raynor: null,
      health: 100,
      level: 1,
      experience: 0,
      damage: 20,
      weapon: "P-55 pistol",
      loading: false,
      zerg: [],
      adjutant: "Clear out the remaining zerg infestation",
      kerrigan: { health: getRandomInt(175, 200), damage: getRandomInt(31, 40) }
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  createMap(currentPlanet) {
    let map = [];
    for (let r = 0; r < 48; r++) {
      let row = [];
      for (let c = 0; c < 48; c++) {
        row.push({ type: ["tile", currentPlanet.wall], fog: true });
      }
      map.push(row);
    }
    return map;
  }
  createRooms() {
    let rooms = [], newCenter = null;
  	while (rooms.length < 4) {
  	    let newRoom = new Room(getRandomInt(4, 35), getRandomInt(4, 35), getRandomInt(6, 9), getRandomInt(6, 9));
  	    let failed = false;
  	    for (let j = 0; j < rooms.length; j++) {
  	      if (newRoom.intersects(rooms[j])) {
  	        failed = true;
  	        break;
  	      }
  	    }
  	    if (!failed) {
  	      this.createRoom(newRoom);
          newCenter = newRoom.center;
          if (rooms.length !== 0) {
            let prevCenter = rooms[rooms.length - 1].center;
            if (Math.random() > 0.5) {
              this.hCorridor(prevCenter.x, newCenter.x, prevCenter.y);
              this.vCorridor(prevCenter.y, newCenter.y, newCenter.x);
            } else {
              this.vCorridor(prevCenter.y, newCenter.y, prevCenter.x);
              this.hCorridor(prevCenter.x, newCenter.x, newCenter.y);
            }
          }
  	      rooms.push(newRoom);
  	    }
  	 }
  }
  createRoom(room) {
    let map = this.state.map;
  	for (let r = room.x; r < room.x + room.width; r++) {
  		for (let c = room.y; c < room.y + room.height; c++) {
        map[r][c].type[1] = this.state.currentPlanet.room;
      }
  	}
    this.setState({ map });
  }
  hCorridor(x1, x2, y) {
    let map = this.state.map;
    for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
      map[x][y].type[1] = this.state.currentPlanet.corridor;
    }
    this.setState({ map });
  }
  vCorridor(y1, y2, x) {
    let map = this.state.map;
    for (let y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
      map[x][y].type[1] = this.state.currentPlanet.corridor;
    }
    this.setState({ map });
  }
  placeZerg() {
    let map = this.state.map, zerg = [], placed = false;
    while (zerg.length < 5) {
      placed = false;
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room) {
                map[r][c].type[1] = "zerg";
                switch (this.state.currentPlanet.name) {
                  case "Mar Sara":
                    zerg.push({
                      id: [r, c].toString(),
                      name: this.state.currentPlanet.zerg[getRandomInt(0, 2)],
                      health: getRandomInt(50, 75),
                      damage: getRandomInt(1, 10)
                    });
                    break;
                  case "Char":
                    zerg.push({
                      id: [r, c].toString(),
                      name: this.state.currentPlanet.zerg[getRandomInt(0, 2)],
                      health: getRandomInt(75, 100),
                      damage: getRandomInt(11, 20)
                    });
                    break;
                  case "Ulaan":
                    zerg.push({
                      id: [r, c].toString(),
                      name: this.state.currentPlanet.zerg[getRandomInt(0, 2)],
                      health: getRandomInt(100, 125),
                      damage: getRandomInt(21, 30)
                    });
                    break;
                }
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map, zerg });
  }
  placeHealthPacks() {
    let map = this.state.map, healthPacks = 0, placed = false;
    while (healthPacks < 5) {
      placed = false;
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room ||
                  map[r][c].type[1] === this.state.currentPlanet.corridor) {
                map[r][c].type[1] = "health-pack";
                healthPacks++;
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map });
  }
  placeWeapon() {
    let placed = false, map = this.state.map;
    while (!placed) {
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room || map[r][c].type[1] === this.state.currentPlanet.corridor) {
                map[r][c].type[1] = "weapon";
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map });
  }
  placeHyperion() {
    let placed = false, map = this.state.map;
    while (!placed) {
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room) {
                map[r][c].type[1] = "hyperion";
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map });
  }
  placeRaynor() {
    let placed = false, map = this.state.map, raynor = this.state.raynor;
    while (!placed) {
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room || map[r][c].type[1] === this.state.currentPlanet.corridor) {
                map[r][c].type[1] = "raynor";
                raynor = [r, c];
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map, raynor });
    this.fog(raynor, null);
  }
  placeKerrigan() {
    let placed = false, map = this.state.map;
    while (!placed) {
      for (let r = 4; r < 44; r++) {
        if (Math.random() < 0.1) {
          for (let c = 4; c < 44; c++) {
            if (Math.random() < 0.1) {
              if (map[r][c].type[1] === this.state.currentPlanet.room) {
                map[r][c].type[1] = "kerrigan";
                placed = true;
                break;
              }
            }
          }
        }
        if (placed) {
          break;
        }
      }
    }
    this.setState({ map });
  }
  nextLevel() {
    this.createRooms();
    this.placeZerg();
    this.placeHealthPacks();
    this.placeWeapon();
    if (this.state.currentPlanet !== planets[2]) {
      this.placeHyperion();
    }
    if (this.state.currentPlanet === planets[2]) {
      this.placeKerrigan();
    }
    this.placeRaynor();
    this.setState({ loading: false});
  }
  restart() {
    this.setState({ currentPlanet: planets[0] });
    this.setState({
      map: this.createMap(planets[0]),
      raynor: null,
      health: 100,
      level: 1,
      experience: 0,
      damage: 20,
      weapon: "P-55 pistol",
      loading: false,
      zerg: [],
      adjutant: "Clear out the remaining zerg infestation" });
      this.nextLevel();
  }
  componentWillMount() {
    this.nextLevel();
  }
  render() {
    return (
      <div>
        <Legend />
        <div className="grid-container">
          {this.state.map.reduce((a, b) => a.concat(b)).map((tile, index) => {
            return ( <Tile style={tile.fog ? ["tile", "fog"] : tile.type} key={index} /> );
          }, this)}
        </div>
        <UI
          planet={this.state.currentPlanet.name}
          level={this.state.level}
          experience={this.state.experience}
          health={this.state.health}
          damage={this.state.damage}
          weapon={this.state.weapon}
          enemies={this.state.zerg.length}
          adjutant={this.state.adjutant}
        />
        <Links />
      </div>
    );
  }
  componentDidMount() {
		window.addEventListener('keyup', throttle(this.handleKeyUp, 100));
	}
	componentWillUnmount() {
		window.removeEventListener('keyup', throttle(this.handleKeyUp, 100));
	}
  handleKeyUp(event)  {
    let next = this.state.raynor;
    switch (event.keyCode) {
      // w
      case 87:
        next = [next[0] - 1, next[1]];
        break;
      // a
      case 65:
        next = [next[0], next[1] - 1];
        break;
      // s
      case 83:
        next = [next[0] + 1, next[1]];
        break;
      // d
      case 68:
        next = [next[0], next[1] + 1];
        break;
      default:
        return;
    }
    this.moveRaynor(next, event.keyCode);
  }
  moveRaynor(next, keyCode) {
    if (!this.state.loading) {
      let map = this.state.map, prev = this.state.raynor;
      if (map[next[0]][next[1]].type[1] === this.state.currentPlanet.room || map[next[0]][next[1]].type[1] === this.state.currentPlanet.corridor) {
        map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
        map[next[0]][next[1]].type[1] = "raynor";
        this.setState({ map, raynor: next });
        this.fog(this.state.raynor, keyCode);
      } else if (map[next[0]][next[1]].type[1] === "health-pack") {
        let health = this.state.health;
        switch (this.state.currentPlanet.name) {
          case "Mar Sara":
            health += getRandomInt(10, 20);
            break;
          case "Char":
          health += getRandomInt(20, 30);
            break;
          case "Ulaan":
          health += getRandomInt(30, 40);
            break;
        }
        map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
        map[next[0]][next[1]].type[1] = "raynor";
        this.setState({ map, raynor: next, health });
        this.fog(this.state.raynor, keyCode);
      } else if (map[next[0]][next[1]].type[1] === "weapon") {
        map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
        map[next[0]][next[1]].type[1] = "raynor";
        this.setState({ map, raynor: next, weapon: this.state.currentPlanet.weapon, damage: this.state.damage += getRandomInt(10, 20) });
        this.fog(this.state.raynor, keyCode);
      } else if (map[next[0]][next[1]].type[1] === "hyperion") {
        if (this.state.currentPlanet.name === "Mar Sara" && this.state.level === 1) {
          this.setState({ adjutant: "You must be level 2 to board the Hyperion!" });
        } else if (this.state.currentPlanet.name === "Char" && this.state.level === 2) {
          this.setState({ adjutant: "You must be level 3 to board the Hyperion!" });
        } else {
          map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
          map[next[0]][next[1]].type[1] = "raynor";
          this.setState({ map });
          this.fog(this.state.raynor, keyCode);
          switch (this.state.currentPlanet.name) {
          case "Mar Sara":
            this.setState({ loading: true });
            this.timeout = setTimeout(() => {
              this.setState({ currentPlanet: planets[1], map: this.createMap(planets[1]) });
              this.nextLevel();
            }, 300);
            break;
          case "Char":
            this.setState({ loading: true });
            this.timeout = setTimeout(() => {
              this.setState({ currentPlanet: planets[2], map: this.createMap(planets[2]) });
              this.nextLevel();
            }, 300);
            break;
          }
        }
      } else if (map[next[0]][next[1]].type[1] === "zerg") {
        let experience = this.state.experience,
        level = this.state.level,
        zerg = this.state.zerg,
        health = this.state.health,
        damage = this.state.damage,
        i = findIndex(this.state.zerg, (z) => {
          return z.id === [next[0], next[1]].toString();
        });
        health -= zerg[i].damage;
        if (health < 1) {
          this.setState({ loading: true, adjutant: "You died! Game restarting..." });
          this.timeout = setTimeout(() => {
            this.restart();
          }, 3000);
        } else {
          if (zerg[i].health - damage < 1) {
            zerg.splice(i, 1);
            map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
            map[next[0]][next[1]].type[1] = "raynor";
            experience += 10;
            if (experience === 50) {
              health += 30;
              level += 1;
              experience = 0;
              damage += getRandomInt(10, 20);
            }
            this.setState({ map, raynor: next, experience, zerg, health, level, damage, adjutant: "Clear out the remaining zerg infestation" });
            this.fog(this.state.raynor, keyCode);
          } else {
            zerg[i].health -= this.state.damage;
            this.setState({ zerg, health });
            this.setState({ adjutant: `${zerg[i].name} (health: ${zerg[i].health})` });
          }
        }
      } else if (map[next[0]][next[1]].type[1] === "kerrigan") {
        let kerrigan = this.state.kerrigan,
        health = this.state.health,
        map = this.state.map;
        health -= kerrigan.damage;
        if (this.state.level !== 4) {
          this.setState({ adjutant: "You must be level 4 to attack Kerrigan!" })
        } else {
          if (health < 1) {
            this.setState({ adjutant: "You died! Game restarting..." });
            this.timeout = setTimeout(() => {
              this.restart();
            }, 3000);
          } else {
            if (kerrigan.health - this.state.damage < 1) {
              map[prev[0]][prev[1]].type[1] = this.state.currentPlanet.room;
              map[next[0]][next[1]].type[1] = "raynor";
              this.setState({ adjutant: "Congrats you win! Game restarting...", loading: true, map, health });
              this.timeout = setTimeout(() => {
                this.restart();
              }, 3000);
            } else {
              kerrigan.health -= this.state.damage;
              this.setState({ health, kerrigan });
              this.setState({ adjutant: `Kerrigan (health: ${kerrigan.health})` });
            }
          }
        }
      }
    }
  }
  fog(raynor, keyCode) {
    let map = this.state.map;
    if (keyCode) {
      switch (keyCode) {
        // w
        case 87:
          for (let i = 0; i < 9; i++) {
            map[raynor[0] + 5][raynor[1] - 4 + i].fog = true;
          }
          break;
        // a
        case 65:
          for (let i = 0; i < 9; i++) {
            map[raynor[0] - 4 + i][raynor[1] + 5].fog = true;
          }
          break;
        // s
        case 83:
          for (let i = 0; i < 9; i++) {
            map[raynor[0] - 5][raynor[1] - 4 + i].fog = true;
          }
          break;
        // d
        case 68:
          for (let i = 0; i < 9; i++) {
            map[raynor[0] - 4 + i][raynor[1] - 5].fog = true;
          }
          break;
      }
    }
    for (let r = raynor[0] - 4; r < raynor[0] + 5; r++) {
      for (let c = raynor[1] - 4; c < raynor[1] + 5; c++) {
        map[r][c].fog = false;
      }
    }
    this.setState({ map });
  }
}

export default DungeonCrawler;
