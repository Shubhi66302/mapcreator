import React, { Component } from "react";
import PixiStage from "./PixiStage";
import { loadSpritesheet } from "actions/actions";
import { connect } from "react-redux";
// this should handle all the click, modifier, drag etc. events...
// TODO: handle drag etc.
var isDragKey = key => key == "Meta" || key == "z" || key == "Control";
class MapViewport extends Component {
  // metaKey decides if drag behaviour should be disabled
  customKeydownListener = ({ key, repeat }) =>
    isDragKey(key) && !repeat
      ? this.props.dispatch({ type: "META-KEY-DOWN" })
      : /Shift/.test(key) && !repeat
        ? this.props.dispatch({ type: "SHIFT-KEY-DOWN" })
        : null;
  customKeyupListener = ({ key, repeat }) =>
    isDragKey(key) && !repeat
      ? this.props.dispatch({ type: "META-KEY-UP" })
      : /Shift/.test(key) && !repeat
        ? this.props.dispatch({ type: "SHIFT-KEY-UP" })
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
    return (
      <div id="mapdiv">
        <PixiStage
          onShiftClickOnMapTile={this.props.onShiftClickOnMapTile}
          shouldProcessDrag={this.props.shouldProcessDrag}
          spriteSheetLoaded={this.props.loaded}
        />
      </div>
    );
  }
}
export default connect(state => ({
  loaded: state.spritesheetLoaded,
  shouldProcessDrag:
    state.selectedArea || (state.selection.metaKey && !state.selection.shiftKey)
      ? true
      : false
}))(MapViewport);
