import React, { Component } from "react";

class SavedMaps extends Component {
  state = {
    maps: [],
    loading: true
  };
  componentDidMount() {
    // fetch maps
    // TODO: handle errors in all fetch responses
    fetch(`/api/maps`)
      .then(res => res.json())
      .then(maps => this.setState({ maps }));
  }
  render() {
    const { maps, loading } = this.state;
    return (
      <div className="container">
        <h3 className="display-5">Choose from existing versions</h3>
        <table className="table">
          <thead>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Created on</th>
            <th scope="col">Updated on</th>
          </thead>

          {maps.map(({ id, name, createdAt, updatedAt }) => (
            <tr>
              <th scope="row">{id}</th>
              <td>{name}</td>
              <td>{createdAt}</td>
              <td>{updatedAt}</td>
            </tr>
          ))}
        </table>
      </div>
    );
  }
}

export default SavedMaps;
