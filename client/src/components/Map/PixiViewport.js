import Viewport from "pixi-viewport";
import { clickOnViewport, dragStart, dragMove, dragEnd } from "actions/actions";
import { registerViewport } from "actions/viewport";
import { PixiComponent, withPixiApp } from "@inlet/react-pixi";

// TODO: add drag support
var PixiViewport = PixiComponent("PixiViewport", {
  create: props => {
    var instance = new Viewport({
      // without this zoom in happens to wrong coordinate
      // https://github.com/davidfig/pixi-viewport/issues/74
      interaction: props.app.renderer.plugins.interaction,
      // TODO: find correct values for these, right now just copy pasted
      screenWidth: 1000,
      screenHeight: 600,
      worldWidth: 10000,
      worldHeight: 10000
    });
    window.addEventListener("resize", () =>
      instance.resize(window.innerWidth, window.innerHeight)
    );

    const { store } = props;

    var onDragStart = e =>
      instance.pause
        ? store.dispatch(dragStart(e.data.getLocalPosition(instance)))
        : null;
    var onDragEnd = e =>
      instance.pause
        ? store.dispatch(dragEnd(e.data.getLocalPosition(instance)))
        : null;
    var onDragMove = e =>
      instance.pause
        ? store.dispatch(dragMove(e.data.getLocalPosition(instance)))
        : null;
    // pixi native events
    // setup events
    instance
      // events for drag start
      .on("mousedown", onDragStart)
      .on("touchstart", onDragStart)
      // events for drag end
      .on("mouseup", onDragEnd)
      .on("mouseupoutside", onDragEnd)
      .on("touchend", onDragEnd)
      .on("touchendoutside", onDragEnd)
      // events for drag move
      .on("mousemove", onDragMove)
      .on("touchmove", onDragMove);

    instance
      .drag()
      .pinch()
      .wheel();
    // .clampZoom({
    //   minWidth: 1000,
    //   maxWidth: 100000,
    //   minHeight: 600,
    //   maxHeight: 100000
    // });
    instance.on("clicked", e => {
      console.log("clicked");
      var tileBounds = store.dispatch(clickOnViewport(e.world));
    });
    // add instance referene to store
    store.dispatch(registerViewport(instance));
    return instance;
  },
  didMount: (instance, parent) => {},
  willUnmount: (instance, parent) => {
    instance.removeListeners();
  },
  applyProps: (instance, oldProps, newProps) => {
    instance.pause = newProps.shouldProcessDrag;
    // don't do anything?
  }
});

export default withPixiApp(PixiViewport);
