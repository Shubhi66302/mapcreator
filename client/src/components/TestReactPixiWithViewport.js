// test @inlet/react-pixi with react-viewport
// verify that we can drag/zoom etc. in viewport and also that large no. of sprites
// can be rendered.
// should probably also test data binding of the rendered sprites and see if updates
// make it slow
import React, { Component, PureComponent } from "react";
import * as PIXI from "pixi.js";
import {
  Stage,
  Sprite,
  PixiComponent,
  Container,
  ParticleContainer,
  Text,
  BitmapText
} from "@inlet/react-pixi";
import Viewport from "pixi-viewport";
import barcodeSprite from "sprites/barcode.png";
import store from "../store";
import { connect, Provider } from "react-redux";
import { TILE_WIDTH, TILE_HEIGHT, SCALE, MAX_SPRITES } from "../constants";
import {
  clickOnViewport,
  fetchMap,
  addPPS,
  changeRandomSprite
} from "../actions/actions";
import {
  tileRenderCoordinateSelector,
  spriteRenderCoordinateSelector,
  tileSpriteNamesWithoutEntityData,
  tileBoundsSelector,
  tileSpriteDataSelector,
  tileDataSelector,
  tileIdsSelector
} from "../utils/selectors";
import { coordinateKeyToTupleOfIntegers } from "../utils/util";

const state = store.getState();
// this removes anti-aliasing somehow
PIXI.settings.PRECISION_FRAGMENT = "highp"; //this makes text looks better

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var ViewportComponent = PixiComponent("Viewport", {
  create: props => {
    return new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 10000,
      worldHeight: 10000
    });
  },
  didMount: (instance, parent) => {
    // parent should be stage?
    // assume it's already been added using addChild, so just do drag etc. binding
    instance
      .drag()
      .pinch()
      .wheel();
    console.log(instance.eventNames());
    instance.on("clicked", e => {
      var tileBounds = store.dispatch(
        clickOnViewport(e.world, tileBoundsSelector(store.getState()))
      );
      console.log("dispatched click event");
    });
    console.log("did mount called");
  },
  willUnmount: (instance, parent) => {},
  applyProps: (instance, oldProps, newProps) => {
    console.log("apply props called");
    instance.pause = newProps.metaKey;

    // don't do anything?
  }
});

var Rectangle = PixiComponent("Rectangle", {
  create: props => {
    return new PIXI.Graphics();
  },
  didMount: (instance, parent) => {
    // instance.interactive = true;
    // instance.on("click", e => console.log("rectangle clicked"));
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill);
    instance.drawRect(x, y, width, height);
    instance.endFill();
  }
});

// const CustomRectWithSprite = PixiComponent({
//   create: props => {
//     return new PIXI.particles.ParticleContainer;
//   },
//   didMount: (instance, parent) => {
//     //
//   }
// })
// TODO: call unsubscribe() somehow in willUnmount
// var deriveTileFromState = (state, tileId) => {
//   var barcode = state.normalizedMap.barcode[tileId];
//   // split barcode string into 7 chars
// };
const CustomSprite = PixiComponent("CustomSprite", {
  create: props => {
    const { tileId, spriteIdx, store } = props;
    // var personalSelector = makeTileSpriteDataSelector();
    const { x, y, spriteName } = tileSpriteDataSelector(store.getState(), {
      tileId,
      spriteIdx
    });
    // var coord = coordinateKeyToTupleOfIntegers(tileId);
    // const { x, y, spriteName } = {
    //   x: coord[0] * 200 + spriteIdx * 20,
    //   y: coord[1] * 250 - (spriteIdx ? 50 : 0),
    //   spriteName: "1.png"
    // };
    var sprite = new PIXI.Sprite(
      PIXI.loader.resources["mySpritesheet"].textures[spriteName]
    );
    // sprite.personalSelector = personalSelector;
    sprite.store = store;
    sprite.spriteName = spriteName;
    // sprite.spriteIdx = props.spriteIdx;
    sprite.x = x;
    sprite.y = y;
    // subscribe to updates, only if tile sprite!
    if (spriteIdx == 0) {
      sprite.unsubscribe = store.subscribe(function() {
        // console.log("got subscribed changed to state");
        var state = sprite.store.getState();
        var { x, y, spriteName } = tileSpriteDataSelector(state, {
          tileId,
          spriteIdx
        });
        // var { x, y, spriteName } = { x: 0, y: 0, spriteName: "2.png" };
        if (spriteName !== sprite.spriteName) {
          sprite.spriteName = spriteName;
          sprite.texture =
            PIXI.loader.resources["mySpritesheet"].textures[spriteName];
        }
      });
    }
    return sprite;
  },
  didMount: (instance, parent) => {
    // subscribe to updates
    // this.unsubscribe = store.subscribe(() => {
    //   // move the sprite
    //   const {tileSpriteValue} = state.tileDict[]
    //   if (sprite.x !== )
    // })
  },
  willUnmount: (instance, parent) => {
    instance.unsubscribe();
  },
  applyProps: (instance, oldProps, newProps) => {
    // console.log(`CustomSprite rerendered! ${newProps.spriteName}`);
    // just change the texture for now?
    // if (oldProps.spriteName != newProps.spriteName)
    //   instance.texture =
    //     PIXI.loader.resources["mySpritesheet"].textures[newProps.spriteName];
  }
});

const DumbSprite = PixiComponent("DumbSprite", {
  create: props => {
    // console.log("new DumbSprite is created!");
    const { x, y, spriteName } = props;
    var sprite = new PIXI.Sprite(
      PIXI.loader.resources["mySpritesheet"].textures[spriteName]
    );
    sprite.x = x;
    sprite.y = y;
    return sprite;
  },
  didMount: (instance, parent) => {},
  willUnmount: (instance, parent) => {
    // console.log("will unmount claled for DumbSprite!");
  },
  applyProps: (instance, oldProps, newProps) => {
    // console.log("apply props called for DumbSprite");
    if (newProps.spriteName != oldProps.spriteName) {
      instance.texture =
        PIXI.loader.resources["mySpritesheet"].textures[newProps.spriteName];
    }
  }
});

class CustomSpriteComponent extends PureComponent {
  // shouldComponentUpdate (nextProps) {
  //   // need this otherwise don't know why re-rendering is happening....
  //   const {x, y, spriteName} = this.props;
  //   return x !== nextProps.x
  // }
  render() {
    // const { spriteData } = this.props;
    // console.log(
    //   `rendering CustomSpriteComponent again ${this.props.spriteName}`
    // );
    return <CustomSprite {...this.props} />;
  }
}

const ConnectedCustomSpriteComponent = connect(() => {
  // const personalSelector = makeTileSpriteDataSelector();
  const personalSelector = tileSpriteDataSelector;
  return (state, { tileId, spriteIdx }) =>
    personalSelector(state, { tileId, spriteIdx });
})(CustomSpriteComponent);

class RectWithSprite extends Component {
  constructor(props) {
    super(props);
    // console.log(`new RectWithSprite with tileId ${props.tileId}`);
  }
  componentDidMount() {
    // subscribe to store updates
    // const { tileId } = this.props;
    // this.unsubscribe = store.subscribe(() => {
    //   var tileInfo = state.tileDict[tileId];
    //   this.setState({
    //     ...tileInfo
    //   });
    // });
  }
  componentWillUnmount() {
    // this.unsubscribe();
  }
  shouldComponentUpdate(newProps, newState) {
    return newProps.tileId !== this.props.tileId;
  }
  render() {
    const { tileId, store } = this.props;
    // console.log(`Rerendering RectWithSprite ${tileId}`);
    var ret = [
      <CustomSprite
        key={0}
        tileId={tileId}
        spriteIdx={0}
        store={store}
        // interactive
        // onClick={() => console.log("sprite clicked")}
      />
    ];
    for (var i = 0; i < 7; i++) {
      ret.push(
        <CustomSprite
          key={i + 1}
          tileId={tileId}
          spriteIdx={i + 1}
          store={store}
        />
      );
    }
    return ret;
  }
}
var resetContainer = (container, state, tileIds) => {
  console.log("resetting ParticleContainerWithAllSprites");
  var { randomSpriteName } = state;
  // delete existing sprites if any
  // don't delet! instead only add sprites for tiles that don't exist
  // if (container.spriteMap) {
  //   Object.entries(container.spriteMap).forEach(([key, sprite]) =>
  //     sprite.destroy()
  //   );
  // }
  var spriteMap = container.spriteMap || {};
  for (let tileId of tileIds) {
    var spriteNames = tileSpriteNamesWithoutEntityData(state, { tileId });
    for (var idx = 0; idx < 8; idx++) {
      var { x, y } = spriteRenderCoordinateSelector(state, {
        tileId,
        spriteIdx: idx
      });
      let sprite = spriteMap[`${tileId}-${idx}`];
      if (!sprite) {
        // make new sprite.
        sprite = new PIXI.Sprite(
          PIXI.loader.resources["mySpritesheet"].textures[spriteNames[idx]]
        );
        container.addChild(sprite);
        spriteMap[`${tileId}-${idx}`] = sprite;
      } else {
        sprite.texture =
          PIXI.loader.resources["mySpritesheet"].textures[spriteNames[idx]];
      }
      // TODO: add logic to find spriteName etc.
      sprite.x = x;
      sprite.y = y;
    }
  }
  // TODO: hide sprites that are not in tileIds
  container.spriteMap = spriteMap;
  // console.log(container.spriteMap);
  return container;
};
// Testing if we can just re-render every sprite while optimizing tile updates
var ParticleContainerWithAllSprites = PixiComponent(
  "ParticleContainerWithAllSprites",
  {
    create: props => {
      console.log("new ParticleContainerWithAllSprites created!");
      var container = new PIXI.particles.ParticleContainer(400000, {
        uvs: true
      });
      var state = store.getState();
      // store prevstate in container?
      container.prevState = state;
      var tileIds = tileIdsSelector(state);
      resetContainer(container, state, tileIds);
      // add event to change spriteName for all sprites
      // do not rely applyProps since it might be called AFTER this method.
      // instead do everything related to state here only.
      container.unsubscribe = store.subscribe(() => {
        // check if tileIds have changed. if yes, then reset container.
        var state = store.getState();
        var tileIds = tileIdsSelector(state);
        const { randomSpriteName } = state;
        // console.log(tileIds);
        // just checking length for now... that's probably good enough even.
        // if (Object.keys(container.spriteMap).length !== tileIds.length * 8)
        var { prevState } = container;
        container.prevState = state;
        if (
          prevState.normalizedMap !== state.normalizedMap ||
          prevState.randomSpriteName !== state.randomSpriteName
        )
          resetContainer(container, state, tileIds);
        else if (prevState.selectedTiles !== state.selectedTiles) {
          console.log("Re-rendering tiles becaues of selection");
          // re render tiles?
          tileIds.forEach(tileId => {
            var spriteNames = tileSpriteNamesWithoutEntityData(state, {
              tileId
            });

            var spriteId = `${tileId}-0`;
            var sprite = container.spriteMap[spriteId];
            if (state.selectedTiles[tileId] !== undefined) {
              // just randomly assign sprites for now, we're only testing time complexity
              sprite.texture =
                PIXI.loader.resources["mySpritesheet"].textures["3.png"];
            } else {
              sprite.texture =
                PIXI.loader.resources["mySpritesheet"].textures[spriteNames[0]];
            }
          });
        }
        // else {
        //   // change texture of every sprite.
        //   console.log(
        //     "changing sprite names in ParticleContainerWithAllSprites"
        //   );
        //   var { randomSpriteName } = state;
        //   Object.entries(container.spriteMap).forEach(([key, sprite]) => {
        //     sprite.texture =
        //       PIXI.loader.resources["mySpritesheet"].textures[randomSpriteName];
        //   });
        // }
      });
      return container;
    },
    didMount: (instance, parent) => {},
    willUnmount: (instance, parent) => {
      instance.unsubscribe();
    },
    applyProps: (instance, oldProps, newProps) => {
      // console.log("re-rendering ParticleContainerWithAllSprites");
      // // destroy all children and add them again.
      // if (oldProps.tileIds != newProps.tileIds) {
      //   Object.entries(instance.spriteMap).forEach(([key, sprite]) =>
      //     sprite.destroy()
      //   );
      // }
      // // re add.
      // addSpritesToContainer(instance, store.getState(), newProps);
    }
  }
);

class SmartRectWithSprites extends Component {
  // componentDidMount() {
  //   console.log(
  //     `mounted SmartReactWithSprites with tileId ${this.props.tileId}`
  //   );
  // }
  shouldComponentUpdate(newProps, newState) {
    // only update if main sprite has changed?
    return (
      newProps.tileId != this.props.tileId ||
      newProps.tileData.spriteNames[0] != this.props.tileData.spriteNames[0]
    );
  }
  render() {
    const { tileId, tileData } = this.props;

    // console.log(`re-rendering tile ${tileId}`);
    var ret = [
      <DumbSprite
        key={0}
        // image={tileData.spriteNames[0]}
        x={tileData.x}
        y={tileData.y}
        spriteName={tileData.spriteNames[0]}
        // interactive
        // onClick={() => console.log("sprite clicked")}
      />
      // need to calculate coords for sprite...
    ];
    return ret;
  }
}
const ConnectedSmartRectWithSprites = connect(() => {
  // const personalSelector = makeTileDataSelector();
  const personalSelector = tileDataSelector;
  // console.log(`new seleector created for some ConnectedSmartRectWithSprites`);
  return (state, { tileId }) => ({
    tileData: personalSelector(state, { tileId })
  });
})(SmartRectWithSprites);
// {
//   /* <Text
//     text={`${x}.${y}`}
//     style={{
//       fontFamily: "Arial",
//       fontSize: 40,
//       fill: 0xff1010,
//       align: "center",
//       resolution: 2
//     }}
//     x={x}
//     y={y}
//   /> */
// },

// ];
// test if store is accessible through context. if not, try to connect() this
var DummyCustomComponent = PixiComponent("DummyCustomComponent", {
  create: props => {
    // console.log(props.store);
    // console.log(this.context);
    // console.log(props.floor);
    return new PIXI.Sprite(
      PIXI.loader.resources["mySpritesheet"].textures["0.png"]
    );
  },
  didMount: (instance, parent) => {
    // subscribe to updates
    // this.unsubscribe = store.subscribe(() => {
    //   // move the sprite
    //   const {tileSpriteValue} = state.tileDict[]
    //   if (sprite.x !== )
    // })
  },
  willUnmount: (instance, parent) => {
    // instance.unsubscribe();
  },
  applyProps: (instance, oldProps, newProps) => {
    // console.log(`CustomSprite rerendered! ${newProps.spriteName}`);
    // just change the texture for now?
    console.log("props changed for dummy custom component?");
  }
});

// now can return list from render() ? using PureComponent to prevent re-render
// when parent component re-renders.
class ListOfRects extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    console.log("checking if ListOfRects needs to be updated?");
    // HACK: only update if length changes. technically should compare arrays
    return (
      nextProps.tileIds.length !== this.props.tileIds.length ||
      nextProps.fontLoaded !== this.props.fontLoaded
    );
    // return nextProps !== this.props;
  }
  render() {
    console.log("full render method is called");
    const { tileIds, fontLoaded, store } = this.props;
    if (!fontLoaded) return [];
    // var arrays = tileIds.map(tileId =>
    //   // means range(8)
    //   [...Array(8).keys()].map(idx => ({ tileId, spriteIdx: idx, store }))
    // );
    // var arrayOfSprites = [].concat.apply([], arrays);
    // console.log('computation done, will render now...')
    // var arrayOfSprites = tileIds.map(tileId => ({
    //   tileId,
    //   spriteIdx: 0,
    //   store
    // }));
    return (
      <ParticleContainerWithAllSprites />
      // <CustomParticleContainer maxSize={MAX_SPRITES}>
      //   {/* {tileIds.map(tileId => (
      //     <RectWithSprite key={tileId} tileId={tileId} store={store} />
      //   ))} */}
      //   {tileIds.map(tileId => (
      //     <RectWithSprite key={tileId} tileId={tileId} store={store} />
      //   ))}
      //   {/*maybe if we just add list of custom sprites here things will be all good*/}
      //   {/* <DummyCustomComponent store={store} /> */}
      //   {/* {arrayOfSprites.map((props, idx) => (
      //     <CustomSprite {...props} key={idx} />
      //   ))} */}
      // </CustomParticleContainer>
    );
  }
}

const ConnectedListOfRects = connect(
  state => ({
    // only barcodes that are not special. TODO: maybe should add test for this also.
    tileIds: tileIdsSelector(state)
  }),
  dispatch => ({})
)(ListOfRects);

const CustomParticleContainer = PixiComponent("CustomParticleContainer", {
  create: props => {
    return new PIXI.particles.ParticleContainer(props.maxSize || 40000, {
      // required to change textures dynamically
      uvs: true
    });
  },
  didMount: (instance, parent) => {
    // add all the sprites to it? lets try react way
  },
  willUnmount: (instance, parent) => {},
  applyProps: (instance, oldProps, newProps) => {}
});

class FetchMapInput extends Component {
  state = {
    value: ""
  };
  onSubmit = e => {
    e.preventDefault();
    const { fetchMap } = this.props;
    if (this.state.value) fetchMap(this.state.value);
    else console.log("type somehting");
  };
  onChange = e => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" value={this.state.value} onChange={this.onChange} />
        <button
          type="submit"
          className="btn btn-primary"
          onClick={this.onSubmit}
        >
          Submit
        </button>
      </form>
    );
  }
}
var ConnectedMapForm = connect(
  () => ({}),
  dispatch => ({
    fetchMap: mapId => dispatch(fetchMap(mapId))
  })
)(FetchMapInput);

class AddPPSInput extends Component {
  state = {
    value: ""
  };
  onSubmit = e => {
    e.preventDefault();
    const { addPPS } = this.props;
    if (this.state.value) addPPS(this.state.value);
    else console.log("type seomthing");
  };
  onChange = e => this.setState({ value: e.target.value });
  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" value={this.state.value} onChange={this.onChange} />
        <button
          type="submit"
          className="btn btn-primary"
          onClick={this.onSubmit}
        >
          Submit New PPS
        </button>
      </form>
    );
  }
}
var ConnectedPPSForm = connect(
  () => ({}),
  dispatch => ({
    addPPS: barcode => dispatch(addPPS(barcode))
  })
)(AddPPSInput);

var RandomSpriteButton = ({ changeRandomSprite }) => (
  <button className="btn btn-primary" onClick={changeRandomSprite}>
    {" "}
    Random Sprite{" "}
  </button>
);
RandomSpriteButton = connect(
  null,
  dispatch => ({
    changeRandomSprite: () => dispatch(changeRandomSprite())
  })
)(RandomSpriteButton);

// NOTE: storybook requires page refresh whenever this file changes
// otherwise you will get weird errors in the render
class App extends Component {
  state = {
    metaKey: false,
    fontLoaded: false,
    textures: null
  };
  componentDidMount() {
    // PIXI.loader
    //   .add("arial", `${process.env.PUBLIC_URL}/arial-bitmap-sparrow.xml`)
    //   .load((loader, resource) => {
    //     console.log("loaded font");
    //     console.log(resource);
    //     this.setState({ fontLoaded: true });
    //   });
    PIXI.loader
      .add(
        "mySpritesheet",
        `${process.env.PUBLIC_URL}/arial-bitmap-sparrow.json`
      )
      .load((loader, resource) => {
        console.log(resource);
        console.log(PIXI.loader.resources["mySpritesheet"].textures);
        this.setState({ fontLoaded: true });
      });
  }
  render() {
    // HACK: using tabindex=0 to make div accept keyboard events
    return (
      <Provider store={store}>
        <div
          tabIndex="0"
          onKeyDown={e => {
            console.log(`key down event ${e}`);
            this.setState({ metaKey: e.metaKey });
          }}
          onKeyUp={e => this.setState({ metaKey: e.metaKey })}
          id="bigdiv"
          style={{ height: 100, width: 100 }}
        >
          <ConnectedMapForm />
          <ConnectedPPSForm />
          <RandomSpriteButton />
          <Stage options={{ antialias: false, transparent: true }}>
            {/* <Container> */}
            <ViewportComponent metaKey={this.state.metaKey}>
              <ConnectedListOfRects
                fontLoaded={this.state.fontLoaded}
                store={store}
              />
              {/* <Sprite image={barcodeSprite} x={100} y={100} interactive /> */}
              <Text
                text="Hello world"
                style={{
                  fontFamily: "Arial",
                  fontSize: 40,
                  fill: 0xff1010,
                  align: "center",
                  resolution: 2
                }}
                resolution={2}
              />
            </ViewportComponent>
            {/* </Container> */}
          </Stage>
        </div>
      </Provider>
    );
  }
}

export default App;
