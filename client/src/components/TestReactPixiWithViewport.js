// test @inlet/react-pixi with react-viewport
// verify that we can drag/zoom etc. in viewport and also that large no. of sprites
// can be rendered.
// should probably also test data binding of the rendered sprites and see if updates
// make it slow
import React, { Component, PureComponent } from "react";
import barcodeSprite from "sprites/barcode.png";
import store, { dummyState } from "../store";
import { connect, Provider } from "react-redux";
// import Provider from "./ReduxProvider";
import { TILE_WIDTH, TILE_HEIGHT, SCALE, MAX_SPRITES } from "../constants";
import {
  clickOnViewport,
  fetchMap,
  addPPS,
  changeRandomSprite
} from "../actions/actions";
import allUpdates from "utils/map-render";
import PixiStage from "./Map/PixiStage";
import { coordinateKeyToTupleOfIntegers } from "../utils/util";

// Testing if we can just re-render every sprite while optimizing tile updates

class FetchMapInput extends Component {
  state = {
    value: ""
  };
  onSubmit = e => {
    e.preventDefault();
    const { fetchMap } = this.props;
    if (this.state.value) fetchMap(this.state.value);
    else console.log("type somehting");
  };
  onChange = e => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" value={this.state.value} onChange={this.onChange} />
        <button
          type="submit"
          className="btn btn-primary"
          onClick={this.onSubmit}
        >
          Submit
        </button>
      </form>
    );
  }
}
var ConnectedMapForm = connect(
  () => ({}),
  dispatch => ({
    fetchMap: mapId => dispatch(fetchMap(mapId))
  })
)(FetchMapInput);

class AddPPSInput extends Component {
  state = {
    value: ""
  };
  onSubmit = e => {
    e.preventDefault();
    const { addPPS } = this.props;
    if (this.state.value) addPPS(this.state.value);
    else console.log("type seomthing");
  };
  onChange = e => this.setState({ value: e.target.value });
  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" value={this.state.value} onChange={this.onChange} />
        <button
          type="submit"
          className="btn btn-primary"
          onClick={this.onSubmit}
        >
          Submit New PPS
        </button>
      </form>
    );
  }
}
var ConnectedPPSForm = connect(
  () => ({}),
  dispatch => ({
    addPPS: barcode => dispatch(addPPS(barcode))
  })
)(AddPPSInput);

var RandomSpriteButton = ({ changeRandomSprite }) => (
  <button className="btn btn-primary" onClick={changeRandomSprite}>
    {" "}
    Random Sprite{" "}
  </button>
);
RandomSpriteButton = connect(
  null,
  dispatch => ({
    changeRandomSprite: () => dispatch(changeRandomSprite())
  })
)(RandomSpriteButton);

// NOTE: storybook requires page refresh whenever this file changes
// otherwise you will get weird errors in the render
class App extends Component {
  state = {
    metaKey: false,
    fontLoaded: false,
    textures: null
  };
  componentDidMount() {
    PIXI.loader
      .add(
        "mySpritesheet",
        `${process.env.PUBLIC_URL}/arial-bitmap-sparrow.json`
      )
      .load((loader, resource) => {
        console.log(resource);
        console.log(PIXI.loader.resources["mySpritesheet"].textures);
        this.setState({ fontLoaded: true });
      });
  }
  render() {
    // HACK: using tabindex=0 to make div accept keyboard events
    return (
      <Provider store={store}>
        <div
          tabIndex="0"
          onKeyDown={e => {
            console.log(`key down event ${e}`);
            this.setState({ metaKey: e.metaKey });
          }}
          onKeyUp={e => this.setState({ metaKey: e.metaKey })}
          id="bigdiv"
          style={{ height: 100, width: 100 }}
        >
          <ConnectedMapForm />
          <ConnectedPPSForm />
          <RandomSpriteButton />
          <PixiStage
            metaKey={this.state.metaKey}
            spriteSheetLoaded={this.state.fontLoaded}
          />
        </div>
      </Provider>
    );
  }
}

export default App;
