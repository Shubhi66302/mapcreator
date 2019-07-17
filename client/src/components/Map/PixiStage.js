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
  getRowColumnInBetweenDistancesAndCoordinates
} from "utils/selectors";
import { clickOnDistanceTile } from "actions/actions";
import PixiSelectionRectangle from "./PixiSelectionRectangle";
import PixiDistanceTileRectangle from "./PixiDistanceTileRectangle";
import PixiNumberSprite from "./PixiNumberSprite";
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
      dispatch,
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
              // TODO: optimize this rendering even more, maybe using ParticleContainer
              <PixiMapContainer key={"first"} store={store} />,
              ...distanceTiles.map(({ x, y, width, height, key }) => [
                <PixiDistanceTileRectangle
                  key={key}
                  rect={{ x, y, width, height }}
                  fill={selectedDistanceTiles[key] ? 0x0000ff : 0x000000}
                  onClick={() => dispatch(clickOnDistanceTile(key))}
                />
              ]),
              ...inBetweenDistances.map(({ x, y, distance }, idx) => [
                <PixiNumberSprite
                  key={2 * idx + 1}
                  number={distance}
                  x={x}
                  y={y}
                />
              ])
            ]
          ) : (
            <Text
              text="loading..."
              style={{
                fontFamily: "Arial",
                fontSize: 40,
                fill: 0xff1010,
                align: "center"
              }}
            />
          )}
          {}
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
  inBetweenDistances: getRowColumnInBetweenDistancesAndCoordinates(state),
  selectedDistanceTiles: state.selection.distanceTiles || {}
}))(PixiStage);
