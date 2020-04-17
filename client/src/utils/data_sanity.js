import { validateChargersLayout } from "./charger_data_sanity";


export const runCompleteDataSanity = (normalizedMap) => {
  var barcodesDict = normalizedMap.entities.barcode;
  var chargers = normalizedMap.entities.charger;
  return validateChargersLayout(chargers, barcodesDict);
};