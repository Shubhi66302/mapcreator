import {
  getNeighbouringBarcodes,
  deleteNeighbourFromBarcode
} from "utils/util";
import _ from "lodash";
import { addQueueBarcodesToPps } from "./queue-barcodes";
import { addElevator, editElevatorCoordinates } from "./elevator-barcodes";
import { editBarcode } from "./edit-barcode";
import { modifyDistanceBetweenBarcodes } from "./distance-between-barcodes";
import {
  deleteChargerData,
  deletePPSQueue,
  deleteElevator
} from "./delete-entities";

export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      return addQueueBarcodesToPps(state, action);

    case "TOGGLE-STORABLE": {
      const { selectedTiles, makeStorable } = action.value;
      let newState = {};
      for (let tileId of selectedTiles) {
        newState[tileId] = { ...state[tileId], store_status: makeStorable };
      }
      return Object.assign({}, state, newState);
    }

    case "DELETE-BARCODES": {
      // iterate over all barcodes and just see if their neighbours exist. if not, make the edge [0,0,0]
      let newState = {};
      var tileIdMap = action.value;
      for (let key of Object.keys(tileIdMap)) {
        if (state[key]) {
          var neighbours = getNeighbouringBarcodes(key, state);
          for (const [idx, nb] of neighbours.entries()) {
            if (nb && !tileIdMap[nb.coordinate]) {
              // its a valid neighbour of the deleted barcode that itself won't be deleted
              if (!newState[nb.coordinate])
                newState[nb.coordinate] = state[nb.coordinate];
              newState[nb.coordinate] = deleteNeighbourFromBarcode(
                newState[nb.coordinate],
                (idx + 2) % 4,
                false
              );
            }
          }
        }
      }
      return { ..._.omit(state, Object.keys(tileIdMap)), ...newState };
    }

    case "MODIFY-DISTANCE-BETWEEN-BARCODES":
      return modifyDistanceBetweenBarcodes(state, action);

    case "MODIFY-BARCODE-NEIGHBOURS": {
      let { tileId, values } = action.value;
      if (!state[tileId]) return state;
      var newBarcode = _.cloneDeep(state[tileId]);
      ["top", "right", "bottom", "left"].forEach((key, idx) => {
        var matches = values[key].neighbours.match(/(\d),(\d),(\d)/);
        newBarcode.neighbours[idx] = [
          parseInt(matches[1]),
          parseInt(matches[2]),
          parseInt(matches[3])
        ];
        newBarcode.size_info[idx] = parseInt(values[key].sizeInfo);
      });
      return { ...state, [tileId]: newBarcode };
    }

    case "ADD-FLOOR": {
      const { map_values } = action.value;
      const keys = map_values.map(barcode => barcode.coordinate);
      const newBarcodesObj = _.fromPairs(_.zip(keys, map_values));
      return { ...state, ...newBarcodesObj };
    }

    case "ASSIGN-ZONE": {
      const { zone_id, mapTiles } = action.value;
      let newState = {};
      Object.keys(mapTiles).forEach(
        key => (newState[key] = { ...state[key], zone: zone_id })
      );
      return { ...state, ...newState };
    }

    case "ADD-ELEVATOR":
      return addElevator(state, action);

    case "EDIT-ELEVATOR-COORDINATES":
      return editElevatorCoordinates(state, action);

    case "EDIT-BARCODE":
      return editBarcode(state, action);

    case "DELETE-CHARGER-DATA":
      return deleteChargerData(state, action);

    case "DELETE-PPS-QUEUE":
      return deletePPSQueue(state, action);

    case "DELETE-ELEVATOR":
      return deleteElevator(state, action);
  }
  return state;
};
