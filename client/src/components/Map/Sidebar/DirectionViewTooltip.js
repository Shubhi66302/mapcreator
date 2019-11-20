import React from "react";
import GenericTooltip from "../Forms/Util/GenericTooltip";
import NoBarcodePng from "sprites/000.png";
import NotAllowedPng from "sprites/100.png";
import LiftDownAllowedPng from "sprites/110.png";
import AllAllowed from "sprites/111.png";

export default () => {
  return (
    <GenericTooltip id="direction-view-tooltip" delayShow={100}>
      <div>
        Marker meanings:
        <table>
          <tbody>
            <tr>
              <td>
                <img style={imgStyle} src={NoBarcodePng} />
              </td>
              <td>
                No barcode exists in that direction ([0,0,0] nb structure)
              </td>
            </tr>
            <tr>
              <td>
                <img style={imgStyle} src={NotAllowedPng} />
              </td>
              <td>
                No movement allowed to adjacent barcode ([1,0,0] nb structure)
              </td>
            </tr>
            <tr>
              <td>
                <img style={imgStyle} src={LiftDownAllowedPng} />
              </td>
              <td>Only lift down movement allowed ([1,1,0] nb structure)</td>
            </tr>
            <tr>
              <td>
                <img style={imgStyle} src={AllAllowed} />
              </td>
              <td>
                Both lift up and lift down movement allowed ([1,1,1] nb
                structure)
              </td>
            </tr>
          </tbody>
        </table>
        If no markers are drawn on a barcode, it means it has default neighbour
        structure
        <br />
        (i.e. [1,1,1] edges). Not drawn just to reduce screen clutter.
      </div>
    </GenericTooltip>
  );
};

var imgStyle = {
  height: "30%"
};
