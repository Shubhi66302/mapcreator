import { validateChargersLayout } from "./charger_data_sanity";
import { validateNeighbours } from "./map_validation";


export const runCompleteDataSanity = (normalizedMap) => {
  var barcodesDict = normalizedMap.entities.barcode;
  var chargers = normalizedMap.entities.charger;
  var chargerLayoutResult = validateChargersLayout(chargers, barcodesDict);
  var mapLayoutResult = validateNeighbours( barcodesDict);
  return {"chargerSanityResult" : chargerLayoutResult,"mapSanityResult" : mapLayoutResult};
};