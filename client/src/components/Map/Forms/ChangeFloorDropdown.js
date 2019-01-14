import React from "react";
import { connect } from "react-redux";
import { changeFloor } from "actions/currentFloor";

const ChangeFloorDropdown = ({ value, onChange, options }) => (
  <form className="form-inline">
    <div className="form-group">
      <label className="col-form-label pr-2">Current Floor:</label>
      <select
        className="form-control"
        value={parseInt(value)}
        onChange={onChange}
      >
        {options.map(floor_id => (
          <option value={parseInt(floor_id)} key={floor_id}>
            {floor_id}
          </option>
        ))}
      </select>
    </div>
  </form>
);

export default connect(
  state => ({
    value: state.currentFloor,
    options: Object.keys(state.normalizedMap.entities.floor)
  }),
  dispatch => ({
    onChange: e => dispatch(changeFloor(e.target.value))
  })
)(ChangeFloorDropdown);
