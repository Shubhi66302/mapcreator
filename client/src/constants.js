// PIXI constants
export var TILE_WIDTH = 180;
export var TILE_HEIGHT = 220;
// tile sprite dimensions used to calculate actual hitbox for registering clicks
export var TILE_SPRITE_WIDTH = 150;
export var TILE_SPRITE_HEIGHT = 150;

export var SCALE = 4;
// constants for offsetting barcode string sprites
export var BARCODE_SPRITE_Y_OFFSET = -50;
export var BARCODE_SPRITE_X_OFFSET = 24;
export var DOT_SPRITE_Y_OFFSET = 30;
export var AFTER_DOT_SPRITE_X_OFFSET = -10;
// approx ~320k sprites are created for a map of size 200x200. if more than MAX_SPRITES
// sprites are present, they won't be rendered and mapcreator won't work.
export var MAX_SPRITES = 400000;
const spritesheetName = "sheet";
export var SPRITESHEET_PATH = `${
  process.env.PUBLIC_URL
}/${spritesheetName}.json`;
// define sprite names for all types of tiles
// TODO: fix these strings when final spritesheet is created
// TODO: add distance tile logic also
export var NORMAL = "normal.png";
export var SELECTED = "selected.png";
export var STORABLE = "storable.png";
export var PPS = "pps.png";
export var CHARGER = "charger.png";
export var CHARGER_ENTRY = "charger-entry.png";
export var QUEUE = "queue.png";
export var DOCK_POINT = "normal.png";
export var DISTANCE_TILE = "normal.png";
// TODO: figure out how to display zones with limited number of colors?
// eg. continental has 16 zones.
// right now just using 1 color? actually zone view is not implemented.
export var ZONE_BASE = "not_implemented.png";
export var ODS_EXCLUDED = "normal.png";
export var EMERGENCY_EXIT = "emergency-exit.png";

// Constants for map charger_location
export var CHARGER_DISTANCE = 205;
