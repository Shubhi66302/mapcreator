import { getFitToSizeViewportRect } from "utils/selectors";
import { getCanvasSize } from "utils/util";

import * as PIXI from "pixi.js";

export const registerViewport = instance => ({
  type: "REGISTER-PIXI-VIEWPORT",
  value: instance
});

export const registerMinimap = instance => ({
  type: "REGISTER-PIXI-MINIMAP",
  value: instance
});

export const fitToViewport = (dispatch, getState) => {
  const state = getState();
  const { top, right, bottom, left } = getFitToSizeViewportRect(state);
  return dispatch(
    snapToCoordinate(
      { x: (right + left) / 2, y: (top + bottom) / 2 },
      right - left
    )
  );
};

export const snapToCoordinate = ({ x, y }, width) => (_dispatch, getState) => {
  const state = getState();
  const {
    viewport: { viewportInstance }
  } = state;
  if (viewportInstance) {
    viewportInstance.snapZoom({
      width,
      center: new PIXI.Point(x, y),
      removeOnComplete: true,
      forceStart: true,
      interrupt: true,
      removeOnInterrupt: true
    });
  }
  return Promise.resolve();
};

export const setViewportClamp = (_dispatch, getState) => {
  const state = getState();
  const {
    viewport: { viewportInstance }
  } = state;
  if (viewportInstance) {
    const { top, right, bottom, left } = getFitToSizeViewportRect(state);
    const { width, height } = getCanvasSize();
    viewportInstance.clampZoom({
      minWidth: width,
      maxWidth: right - left,
      minHeight: height,
      maxHeight: bottom - top
    });
  }
  return Promise.resolve();
};
