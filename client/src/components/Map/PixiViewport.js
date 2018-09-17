import Viewport from "pixi-viewport";
import { clickOnViewport } from "actions/actions";
import { PixiComponent, withPixiApp } from "@inlet/react-pixi";

// TODO: add drag support
var PixiViewport = PixiComponent("PixiViewport", {
  create: props => {
    var instance = new Viewport({
      // without this zoom in happens to wrong coordinate
      // https://github.com/davidfig/pixi-viewport/issues/74
      interaction: props.app.renderer.plugins.interaction,
      // TODO: find correct values for these, right now just copy pasted
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 10000,
      worldHeight: 10000
    });
    window.addEventListener("resize", () =>
      instance.resize(window.innerWidth, window.innerHeight)
    );
    const { store } = props;
    instance
      .drag()
      .pinch()
      .wheel();
    instance.on("clicked", e => {
      var tileBounds = store.dispatch(clickOnViewport(e.world));
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

export default withPixiApp(PixiViewport);
