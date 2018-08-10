import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

export default () => (
  <div className="container">
    <h3 className="display-5">Choose one of the below options</h3>
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
