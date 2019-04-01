export const setSuccessMessage = message => ({
  type: "SET-SUCCESS-MESSAGE",
  value: message
});
export const clearSuccessMessage = () => ({
  type: "CLEAR-SUCCESS-MESSAGE"
});
export const setErrorMessage = message => ({
  type: "SET-ERROR-MESSAGE",
  value: message
});
export const clearErrorMessage = () => ({
  type: "CLEAR-ERROR-MESSAGE"
});
