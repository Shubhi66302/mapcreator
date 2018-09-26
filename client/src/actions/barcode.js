
export const createNewBarcode = ({coordinate, neighbours, barcode, size_info}) => ({
  barcode,
  coordinate,
  neighbours,
  blocked: false,
  zone: 'defzone',
  store_status: 0,
  size_info,
  bot_id: 'null'
})

export const addNewBarcode(formData)