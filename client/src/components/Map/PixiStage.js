import React, { Component } from "react";
import { Stage, Text } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import PixiMapContainer from "./PixiMapContainer";
import PixiViewport from "./PixiViewport";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getRectFromDiagonalPoints } from "utils/selectors";
import PixiSelectionRectangle from "./PixiSelectionRectangle";
// this removes anti-aliasing somehow
PIXI.settings.PRECISION_FRAGMENT = "highp"; // this makes text looks better

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

class PixiStage extends Component {
  render() {
    const { store } = this.context;
    const {
      spriteSheetLoaded,
      isMapLoaded,
      dragSelectRect,
      ...rest
    } = this.props;
    return (
      <Stage
        options={{
          antialias: false,
          transparent: true
        }}
      >
        {/* <Container> */}
        <PixiViewport {...rest} store={store}>
          {spriteSheetLoaded && isMapLoaded ? (
            <PixiMapContainer store={store} />
          ) : (
            <Text
              text="loading..."
              style={{
                fontFamily: "Arial",
                fontSize: 40,
                fill: 0xff1010,
                align: "center"
                // resolution: 2
              }}
              // resolution={2}
            />
          )}

          <PixiSelectionRectangle
            fill={0x0000ff}
            alpha={0.5}
            rect={dragSelectRect}
          />
        </PixiViewport>
      </Stage>
    );
  }
}
PixiStage.contextTypes = {
  store: PropTypes.object
};
export default connect(state => ({
  isMapLoaded: state.normalizedMap ? true : false,
  dragSelectRect: state.selectedArea
    ? getRectFromDiagonalPoints(state.selectedArea)
    : null
}))(PixiStage);
