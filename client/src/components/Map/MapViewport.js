import React, { Component } from "react";
import PixiStage from "./PixiStage";
import * as PIXI from "pixi.js";
import { loadSpritesheet } from "actions/actions";
import { connect } from "react-redux";
// this should handle all the click, modifier, drag etc. events...
// TODO: handle drag etc.
class MapViewport extends Component {
  // metaKey decides if drag behaviour should be disabled
  customKeydownListener = ({ key, repeat }) =>
    key == "Meta" && !repeat
      ? this.props.dispatch({ type: "META-KEY-DOWN" })
      : null;
  customKeyupListener = ({ key, repeat }) =>
    key == "Meta" && !repeat
      ? this.props.dispatch({ type: "META-KEY-UP" })
      : null;

  componentDidMount() {
    const { dispatch, loaded } = this.props;
    if (!loaded) dispatch(loadSpritesheet());
    document.addEventListener("keydown", this.customKeydownListener);
    document.addEventListener("keyup", this.customKeyupListener);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.customKeydownListener);
    document.removeEventListener("keyup", this.customKeyupListener);
  }
  render() {
    // HACK: using tabindex=0 to make div accept keyboard events, should figure
    // out a better method
    return (
      <div id="mapdiv" style={{ height: 600, width: 800 }}>
        <PixiStage
          shouldProcessDrag={this.props.shouldProcessDrag}
          spriteSheetLoaded={this.props.loaded}
        />
      </div>
    );
  }
}
export default connect(state => ({
  loaded: state.spritesheetLoaded,
  shouldProcessDrag: state.selectedArea || state.metaKey ? true : false
}))(MapViewport);
