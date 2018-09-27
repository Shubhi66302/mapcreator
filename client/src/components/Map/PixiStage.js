import React, { Component } from "react";
import { Stage, Text } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import PixiMapContainer from "./PixiMapContainer";
import PixiViewport from "./PixiViewport";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getRectFromDiagonalPoints,
  distanceTileSpritesSelector,
  getTileInBetweenDistances
} from "utils/selectors";
import PixiSelectionRectangle from "./PixiSelectionRectangle";
import PixiDistanceTileRectange from "./PixiDistanceTileRectange";
import _ from "lodash";
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
      state,
      ...rest
    } = this.props;
    // TODO: optimize this rendering
    const distanceTiles = distanceTileSpritesSelector(state);
    const inBetweenDistances = getTileInBetweenDistances(state);
    return (
      <Stage
        options={{
          antialias: false,
          transparent: true
        }}
        width={1000}
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
          {_.zip(distanceTiles, inBetweenDistances).map(
            ([{ x, y, width, height }, dist], idx) => [
              <PixiDistanceTileRectange
                key={2 * idx}
                rect={{ x, y, width, height }}
              />,
              <Text
                key={2 * idx + 1}
                text={`${dist}`}
                style={{
                  fontFamily: "Arial",
                  fontSize: 35,
                  fill: 0x000000,
                  align: "center"
                  // resolution: 2
                }}
                x={x}
                // TODO: make a constant
                y={y - 40}
              />
            ]
          )}
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
    : { top: 0, left: 0, right: 0, bottom: 0 },
  state
}))(PixiStage);
