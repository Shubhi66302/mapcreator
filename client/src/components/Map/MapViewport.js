import React, { Component } from "react";
import PixiStage from "./PixiStage";
import * as PIXI from "pixi.js";
import { loadSpritesheet } from "actions/actions";
import { connect } from "react-redux";
// this should handle all the click, modifier, drag etc. events...
// TODO: handle drag etc.
class MapViewport extends Component {
  // metaKey decides if drag behaviour should be disabled
  state = {
    metaKey: false,
    spriteSheetLoaded: false
  };
  componentDidMount() {
    const { loadSpritesheet, loaded } = this.props;
    if (!loaded) loadSpritesheet();
  }
  render() {
    // HACK: using tabindex=0 to make div accept keyboard events, should figure
    // out a better method
    return (
      <div
        tabIndex="0"
        onKeyDown={e => {
          this.setState({ metaKey: e.metaKey });
        }}
        onKeyUp={e => this.setState({ metaKey: e.metaKey })}
        id="mapdiv"
        style={{ height: 600, width: 800 }}
      >
        <PixiStage
          metaKey={this.state.metaKey}
          spriteSheetLoaded={this.props.loaded}
        />
      </div>
    );
  }
}
export default connect(
  state => ({ loaded: state.spritesheetLoaded }),
  dispatch => ({
    loadSpritesheet: () => dispatch(loadSpritesheet())
  })
)(MapViewport);
