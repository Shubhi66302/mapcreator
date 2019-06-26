import React, { Component } from "react";
import { handleErrors } from "utils/util";
import { Link } from "react-router-dom";
import moment from "moment";
import SearchBar from "components/SavedMaps/SearchBar";
import { getAllMaps } from "utils/api";

class SavedMaps extends Component {
  state = {
    maps: [],
    loading: true
  };
  componentDidMount() {
    // fetch maps
    getAllMaps()
      .then(handleErrors)
      .then(res => res.json())
      .then(maps => this.setState({ maps }))
      // TODO: not doing anything with error right now
      .catch(() => {});
  }
  render() {
    const { maps } = this.state;

    return (
      <div className="container">
        <h3 className="display-5">Choose from existing maps</h3>
        <SearchBar
          onResults={results =>
            results.json().then(maps => this.setState({ maps }))
          }
        />
        <table className="table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Created on</th>
              <th scope="col">Updated on</th>
            </tr>
          </thead>
          <tbody>
            {maps.map(({ id, name, createdAt, updatedAt }, idx) => (
              <tr key={idx}>
                <th scope="row">{id}</th>
                <td>
                  <Link to={`/map/${id}`}>{name}</Link>
                </td>
                <td>{moment(createdAt).format("lll")}</td>
                <td>{moment(updatedAt).format("lll")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default SavedMaps;
