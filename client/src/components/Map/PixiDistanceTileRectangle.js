import * as PIXI from "pixi.js";
import { PixiComponent } from "@inlet/react-pixi";
export default PixiComponent("DistanceTileRectangle", {
  create: props => {
    const instance = new PIXI.Graphics();
    instance.interactive = true;
    instance.on("click", () => {
      props.onClick();
    });
    return instance;
  },
  didMount: () => {
    // apply custom logic on mount
  },
  willUnmount: () => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    if(oldProps === newProps){
      return;
    }
    
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
