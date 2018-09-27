import * as PIXI from "pixi.js";
import { PixiComponent } from "@inlet/react-pixi";
import * as constants from "../../constants";
export default PixiComponent("DistanceTileRectangle", {
  create: props => {
    return new PIXI.Graphics();
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    if (!newProps.rect) {
      instance.clear();
      return;
    }
    const {
      fill = 0x000000,
      alpha = 1.0,
      rect: { x, y, width, height }
    } = newProps;

    instance.clear();
    instance.alpha = alpha;
    instance.beginFill(fill);
    instance.drawRect(x, y, width, height);
    instance.endFill();
  }
});
