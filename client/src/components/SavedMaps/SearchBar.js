import React from "react";
import debounce from "lodash.debounce";

const fetchMaps = (query, onResults) => {
  return fetch(`/api/maps?str=${query}`).then(res => onResults(res));
};
const debouncedFetchMaps = debounce(fetchMaps, 500, {
  leading: false,
  trailing: true
});

export default ({ onResults }) => (
  <input
    type="text"
    className="form-control my-3"
    placeholder="Search"
    onChange={e => debouncedFetchMaps(e.target.value, onResults)}
  />
);
