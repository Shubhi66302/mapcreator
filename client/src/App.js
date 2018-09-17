import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
// import bootstrap?
import "bootstrap/dist/css/bootstrap.min.css";
import SavedMaps from "./containers/SavedMaps";
import Home from "./containers/Home";
import Guidelines from "./containers/Guidelines";
import Map from "./containers/Map";
import ImportMap from "./containers/ImportMap";
import CreateMap from "./containers/CreateMap";

class App extends Component {
  state = {
    fetched: null
  };
  render() {
    const { fetched } = this.state;
    return (
      <Router>
        <div className="container">
          {/*<ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/version">About</Link>
            </li>
            </ul>

          <hr />*/}

          <Route exact path="/" component={Home} />
          <Route path="/version" component={SavedMaps} />
          <Route path="/guidelines" component={Guidelines} />
          <Route path="/map/:id" component={Map} />
          <Route path="/existing" component={ImportMap} />
          <Route path="/new" component={CreateMap} />
        </div>
      </Router>
    );
  }
}

export default App;
