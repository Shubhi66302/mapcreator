import { validateChargersLayout } from "./charger-data-sanity";
import { validateNeighbours } from "./map-validation";
import { validateAllPpses } from "./pps-validation";

export const runCompleteDataSanity = (normalizedMap) => {
  var barcodesDict = normalizedMap.entities.barcode;
  var chargers = normalizedMap.entities.charger;
  var ppses = normalizedMap.entities.pps;
  var chargerLayoutResult = validateChargersLayout(chargers, barcodesDict);
  var mapLayoutResult = validateNeighbours( barcodesDict);
  var ppsSanityResult = validateAllPpses(ppses, barcodesDict);
  return {"chargerSanityResult" : chargerLayoutResult,"mapSanityResult" : mapLayoutResult, "ppsSanityResult" : ppsSanityResult};
};