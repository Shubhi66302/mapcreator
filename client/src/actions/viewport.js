import { getFitToSizeViewportRect } from "utils/selectors";
import * as PIXI from "pixi.js";
import * as constants from "../constants";
export const registerViewport = instance => ({
  type: "REGISTER-PIXI-VIEWPORT",
  value: instance
});

export const fitToViewport = (_dispatch, getState) => {
  const state = getState();
  const {
    viewport: { instance }
  } = state;
  if (instance) {
    const { top, right, bottom, left } = getFitToSizeViewportRect(state);
    instance.snapZoom({
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
    viewport: { instance }
  } = state;
  if (instance) {
    const { top, right, bottom, left } = getFitToSizeViewportRect(state);
    instance.clampZoom({
      minWidth: constants.VIEWPORT_WIDTH,
      maxWidth: right - left,
      minHeight: constants.VIEWPORT_HEIGHT,
      maxHeight: bottom - top
    });
  }
  return Promise.resolve();
};
