import * as PIXI from "pixi.js";
import { PixiComponent } from "@inlet/react-pixi";
export default PixiComponent("SelectionRectangle", {
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
      fill,
      alpha,
      rect: { top, right, bottom, left }
    } = newProps;

    instance.clear();
    instance.alpha = alpha;
    instance.beginFill(fill);
    instance.drawRect(left, top, right - left, bottom - top);
    instance.endFill();
  }
});
