import * as PIXI from "pixi.js";
import * as constants from "../../constants";
import { PixiComponent } from "@inlet/react-pixi";
import _ from "lodash";

var updateContainer = (container, { x, y, number }) => {
  container.removeChildren();
  container.position.x = x;
  container.position.y = y;
  const scaleMap = constants.DISTANCE_NUMBER_SCALE_MAP;
  // TODO: can add some claming
  const [maxDistance, maxScale] = scaleMap.max;
  const [minDistance, minScale] = scaleMap.min;
  const scale = minScale + number * (maxScale - minScale) / (maxDistance - minDistance);
  container.scale = new PIXI.Point(scale, scale);
  const digits = number.toString().split("");
  digits.forEach((digit, idx) => {
    var digitSprite = new PIXI.Sprite(
      PIXI.loader.resources["mySpritesheet"].textures[`${digit}.png`]
    );
    digitSprite.x = idx * constants.BARCODE_DIGIT_WIDTH;
    digitSprite.y = 0;
    container.addChild(digitSprite);
  });
};
export default PixiComponent("NumberSprite", {
  create: props => {
    var instance = new PIXI.Container();
    updateContainer(instance, props);

    return instance;
  },
  didMount: () => {
    // apply custom logic on mount
  },
  willUnmount: () => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    if (_.isEqual(oldProps, newProps)) return;
    updateContainer(instance, newProps);
  }
});
