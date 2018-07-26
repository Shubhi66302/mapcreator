import React, { Component } from "react";

export default () => (
  <div className="container">
    <h3 className="display-5">Bot Rack Threshold</h3>
    <span>
      When a map is created, default distance between rows/columns is 1500.
      Neighbour structure of the tiles is also updated on this assumption. When
      you want to change this assumption (that butler with rack threshold is
      different than 750) you need to follow the steps as given below:
      <ul>
        <li>Click on the button 'Bot with rack distance threshold'</li>
        <li>Update the value in the text box if it is different</li>
        <li>On clicking ok, it will close</li>
        <li>
          Now select all rows/columns distance tiles (that show 1500,1220 etc)
          that are less than the previous assumption
        </li>
      </ul>
      Note: Bot with rack distance threshold decides which barcodes' neighbour
      structure will allow butler going to the next barcode with rack or not. If
      the distance between two barcodes is less than 750 (given above), map will
      allow movement with rack to this barcode. However, if the distance is less
      than 750, map will show neighbour structure as [1,1,0] i.e. butler cannot
      go to this barcode with rack.
    </span>
  </div>
);
