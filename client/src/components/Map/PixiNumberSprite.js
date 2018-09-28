import * as PIXI from "pixi.js";
import * as constants from "../../constants";
import { PixiComponent } from "@inlet/react-pixi";
import _ from "lodash";

var updateContainer = (container, { x, y, scale = 1.0, number }) => {
  container.removeChildren();
  container.position.x = x;
  container.position.y = y;
  container.scale = new PIXI.Point(scale, scale);
  const digits = number.toString().split("");
  digits.forEach((digit, idx) => {
    var digitSprite = new PIXI.Sprite(
      PIXI.loader.resources["mySpritesheet"].textures[`${digit}.png`]
    );
    digitSprite.x = idx * constants.BARCODE_SPRITE_X_OFFSET;
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
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    if (_.isEqual(oldProps, newProps)) return;
    updateContainer(instance, newProps);
  }
});
