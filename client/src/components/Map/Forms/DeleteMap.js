import React, { Component } from "react";
import ButtonForm from "./Util/ButtonForm";
import { deleteMap } from "actions/actions";
import { connect } from "react-redux";
import { getMapId, getMapName } from "utils/selectors";
import { withRouter } from "react-router-dom";

class DeleteMap extends Component {
  state = {
    show: false,
    name: ""
  };
  toggle = () => this.setState({ show: !this.state.show });
  onSubmit = () => {
    const { dispatch, history, mapId } = this.props;
    dispatch(deleteMap(mapId, history));
    this.toggle();
  };
  render() {
    const { show, name } = this.state;
    const { mapId, mapName } = this.props;
    return (
      <ButtonForm
        buttonText="Delete Map"
        btnClass="btn-outline-danger"
        wrapInButtonGroup={false}
        show={show}
        toggle={this.toggle}
        style={{textAlign:"-webkit-center", color:"black"}}
        title="Are you absolutely sure?"
        bcolor = "red"
      >
        <span>
          This will permanently delete map #{mapId}. This action cannot be
          undone.
        </span>
        <br />
        <span>Please type in the name of the map to confirm.</span>
        <div className="form-group ">
          <input
            className="form-control"
            name={name}
            onChange={e => this.setState({ name: e.target.value })}
            onPaste={e => e.preventDefault()}
          />
        </div>
        <button
          className="btn btn-danger"
          onClick={this.onSubmit}
          disabled={name != mapName}
        >
          I understand the consequences, delete this map
        </button>
      </ButtonForm>
    );
  }
}

// add both redux and react-router decorators
export default withRouter(
  connect(state => ({
    mapId: getMapId(state),
    mapName: getMapName(state)
  }))(DeleteMap)
);
