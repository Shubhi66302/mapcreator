import { validateChargersLayout } from "./charger-data-sanity";
import { mapSanityResult } from "./map-validation";
import { validateAllPpses } from "./pps-validation";

export const runCompleteDataSanity = (normalizedMap) => {
  var barcodesDict = normalizedMap.entities.barcode;
  var chargers = normalizedMap.entities.charger;
  var ppses = normalizedMap.entities.pps;
  var chargerLayoutResult ;
  if(normalizedMap.entities.charger == undefined){
    chargerLayoutResult = true;
  }else{
    chargerLayoutResult = validateChargersLayout(chargers, barcodesDict);
  };
  var ppsSanityResult;
  if(normalizedMap.entities.pps == undefined){
    ppsSanityResult = true;
  }else{
    ppsSanityResult = validateAllPpses(ppses, barcodesDict);
  };
  var mapLayoutResult = mapSanityResult(barcodesDict);
  return {"chargerSanityResult" : chargerLayoutResult,"mapSanity" : mapLayoutResult, "ppsSanityResult" : ppsSanityResult};
};
