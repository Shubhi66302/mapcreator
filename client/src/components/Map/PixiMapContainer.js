import { PixiComponent } from "@inlet/react-pixi";
import mapUpdateFn from "utils/map-render";
import * as PIXI from "pixi.js";

var PixiMapContainer = PixiComponent("PixiMapContainer", {
  create: props => {
    var container = new PIXI.particles.ParticleContainer(400000, {
      uvs: true,
      rotation: true
    });
    const { store } = props;
    var state = store.getState();
    mapUpdateFn(container, state);
    // do not rely applyProps since it might be called AFTER this method.
    // instead do everything related to state here only.
    container.unsubscribe = store.subscribe(() => {
      // check if tileIds have changed. if yes, then reset container.
      var state = store.getState();
      mapUpdateFn(container, state);
    });
    return container;
  },
  didMount: () => {},
  willUnmount: instance => {
    instance.unsubscribe();
  },
  applyProps: () => {}
});

export default PixiMapContainer;
