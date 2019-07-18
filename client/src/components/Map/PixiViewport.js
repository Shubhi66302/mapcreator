import Viewport from "pixi-viewport";
import { clickOnViewport, dragStart, dragMove, dragEnd } from "actions/actions";
import { registerViewport } from "actions/viewport";
import { PixiComponent, withPixiApp } from "@inlet/react-pixi";
import { getCanvasSize } from "utils/util";
// TODO: add drag support
var PixiViewport = PixiComponent("PixiViewport", {
  create: props => {
    const { width, height } = getCanvasSize();
    var instance = new Viewport({
      // without this zoom in happens to wrong coordinate
      // https://github.com/davidfig/pixi-viewport/issues/74
      interaction: props.app.renderer.plugins.interaction,
      // TODO: find correct values for these, right now just copy pasted
      screenWidth: width,
      screenHeight: height,
      worldWidth: 10000,
      worldHeight: 10000
    });
    window.addEventListener("resize", () => {
      const { width, height } = getCanvasSize();
      instance.resize(width, height);
    });

    const { store, onShiftClickOnMapTile } = props;

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
    instance.on("clicked", e => {
      store.dispatch(clickOnViewport(e.world, onShiftClickOnMapTile));
    });
    // add instance referene to store
    store.dispatch(registerViewport(instance));
    return instance;
  },
  didMount: () => {},
  willUnmount: instance => {
    instance.removeListeners();
  },
  applyProps: (instance, oldProps, newProps) => {
    instance.pause = newProps.shouldProcessDrag;
    // don't do anything?
  }
});

export default withPixiApp(PixiViewport);
