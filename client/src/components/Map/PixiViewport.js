import Viewport from "pixi-viewport";
import { clickOnViewport } from "actions/actions";
import { tileBoundsSelector } from "utils/selectors";
import { PixiComponent } from "@inlet/react-pixi";

// TODO: add drag support
var PixiViewport = PixiComponent("PixiViewport", {
  create: props => {
    var instance = new Viewport({
      // TODO: find correct values for these, right now just copy pasted
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 10000,
      worldHeight: 10000
    });
    const { store } = props;
    instance
      .drag()
      .pinch()
      .wheel();
    instance.on("clicked", e => {
      var tileBounds = store.dispatch(
        clickOnViewport(e.world, tileBoundsSelector(store.getState()))
      );
    });
    return instance;
  },
  didMount: (instance, parent) => {},
  willUnmount: (instance, parent) => {
    instance.removeListeners();
  },
  applyProps: (instance, oldProps, newProps) => {
    instance.pause = newProps.metaKey;
    // don't do anything?
  }
});

export default PixiViewport;
