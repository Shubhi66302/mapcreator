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

export const fitToViewport = (_dispatch, getState) => {
  const state = getState();
  const {
    viewport: { viewportInstance }
  } = state;
  if (viewportInstance) {
    const { top, right, bottom, left } = getFitToSizeViewportRect(state);
    viewportInstance.snapZoom({
      width: right - left,
      bullshit: true,
      center: new PIXI.Point((right + left) / 2, (top + bottom) / 2),
      removeOnComplete: true
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
