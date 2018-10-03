import React, { Component } from "react";
import { Stage, Text } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import * as constants from "../../constants";
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
import PixiNumberSprite from "./PixiNumberSprite";
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
      distanceTiles,
      inBetweenDistances,
      selectedDistanceTiles,
      ...rest
    } = this.props;
    return (
      <Stage
        options={{
          antialias: false,
          transparent: true
        }}
        width={constants.VIEWPORT_WIDTH}
        height={constants.VIEWPORT_HEIGHT}
      >
        <PixiViewport {...rest} store={store}>
          {spriteSheetLoaded && isMapLoaded ? (
            [
              // TODO: optimize this rendering even more
              <PixiMapContainer key={"first"} store={store} />,
              ..._.zip(distanceTiles, inBetweenDistances).map(
                ([{ x, y, width, height }, dist], idx) => [
                  <PixiDistanceTileRectange
                    key={2 * idx}
                    rect={{ x, y, width, height }}
                    fill={selectedDistanceTiles[idx] ? 0x0000ff : 0x000000}
                  />,
                  <PixiNumberSprite
                    key={2 * idx + 1}
                    number={dist}
                    x={x}
                    y={y - 40}
                    scale={0.8}
                  />
                ]
              )
            ]
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
    : { top: 0, left: 0, right: 0, bottom: 0 },
  distanceTiles: distanceTileSpritesSelector(state),
  inBetweenDistances: getTileInBetweenDistances(state),
  selectedDistanceTiles: state.selectedDistanceTiles || {}
}))(PixiStage);
