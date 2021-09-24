import React, { Component } from "react";
import ButtonForm from "./Util/ButtonForm";
import { requestValidation } from "actions/actions";
import { connect } from "react-redux";
import { getMapId, getNormalizedMap } from "utils/selectors";
import { withRouter } from "react-router-dom";

class RequestValidation extends Component {
  state = {
    show: false,
    name: ""
  };
  toggle = () => this.setState({ show: !this.state.show });
  onSubmit = () => {
    const { dispatch, mapId, nMap } = this.props;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(emailRegex.test(this.state.email)){
      dispatch(requestValidation(mapId, this.state.email, nMap.entities.mapObj[mapId].updatedAt));
    } else {
      this.setState({ invalid: "Invalid Email ID!" });
    }
    this.toggle();
  };
  render() {
    const { show, email } = this.state;
    const { mapId, nMap } = this.props;
    return (
      <ButtonForm
        buttonText="Request Validation"
        btnClass="btn btn-outline-secondary validate-req mr-1"
        wrapInButtonGroup={false}
        disabled={nMap.entities.mapObj[mapId].validationRequested || nMap.entities.mapObj[mapId].sanity}
        show={show}
        toggle={this.toggle}
        style={{textAlign:"-webkit-center"}}
        title="Request Map Validation"
      >
        <span>
            This will be used further to notify and to send sanity reports.
        </span>
        <br />
        <span>Please type in the email ID to request -</span>
        <div className="form-group ">
          <input
            className="form-control"
            name={email}
            onChange={e => this.setState({ email: e.target.value, invalid: "" })}
            onPaste={e => e.preventDefault()}
          />
        </div>
        <button
          className="btn btn-info"
          disabled={typeof email === "undefined" || email === ""}
          onClick={this.onSubmit}
        >
          Submit Request
        </button>
        <br/>
        <span className="text-danger">{this.state.invalid}</span>
      </ButtonForm>
    );
  }
}

// add both redux and react-router decorators
export default withRouter(
  connect(state => ({
    mapId: getMapId(state),
    nMap: getNormalizedMap(state)
  }))(RequestValidation)
);
