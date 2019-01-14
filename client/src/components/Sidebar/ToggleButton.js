import React from "react";

export default () => (
  <div id="content">
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <button type="button" id="sidebarCollapse" className="btn btn-info">
          <i className="fas fa-align-left" />
          <span>Toggle Sidebar</span>
        </button>
      </div>
    </nav>
  </div>
);
