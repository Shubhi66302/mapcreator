import React from "react";
import { LinkContainer } from "react-router-bootstrap";

var Home = () => (
  <div className="container">
    <div className="row justify-content-between">
      <div className="col">
        <h3 className="display-5">Mapcreator</h3>
      </div>
      <div className="col pt-auto">
        {process.env.REACT_APP_COMMIT_ID ? (
          <h4 style={{ textAlign: "right", marginBottom: 0 }}>
            commit id: {process.env.REACT_APP_COMMIT_ID}
          </h4>
        ) : (
          ""
        )}
      </div>
    </div>
    <div className="list-group">
      <LinkContainer to="/new">
        <a className="list-group-item list-group-item-action">Create new map</a>
      </LinkContainer>
      <LinkContainer to="/existing">
        <a className="list-group-item list-group-item-action">
          Import an existing map
        </a>
      </LinkContainer>
      <LinkContainer to="/version">
        <a className="list-group-item list-group-item-action">Saved maps</a>
      </LinkContainer>
      <LinkContainer to="/guidelines">
        <a className="list-group-item list-group-item-action">
          View Guidelines
        </a>
      </LinkContainer>
    </div>
  </div>
);

export default Home;
