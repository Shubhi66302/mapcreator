export default (state = {}, action) => {
  switch (action.type) {
    case "SECTOR-BARCODE-MAPPING": {
      const { entities } = action.value;
      entities.sectorBarcodeMapping = [];
      Object.keys(entities.barcode).forEach(function(key) {
        if(entities.sectorBarcodeMapping[entities.barcode[key].sector] == undefined) entities.sectorBarcodeMapping[entities.barcode[key].sector] = []; 
        entities.sectorBarcodeMapping[entities.barcode[key].sector].push("[" + key + "]");
      });
      return { ...state, ...entities.sectorBarcodeMapping };
    }
  }
  return state;
};