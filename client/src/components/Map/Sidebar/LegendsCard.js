import React from "react";
import { connect } from "react-redux";
import NonCollapsibleBaseCard from "./NonCollapsibleBaseCard";
import AllAllowed from "sprites/111.png";
import * as constants from "../../../constants";
const title = "Legends";
const LegendsMap = constants.LEGENDSMAP;
const LegendsCard = () => (
  <div className="pt-3">
    <h4 className="menu-title">{title}</h4>
    <NonCollapsibleBaseCard title={title}>
      {LegendsMap.map((e, idx) => {
        return (
          <div className="row" key={idx} style={{ marginLeft: "5%" }}>
            {e.colorCode && <div className="col-1" style={{ height: 20, width: "100%", backgroundColor: e.colorCode, marginTop: 2}}></div>}
            {e.icon && <div className="col-1" style={{ height: 20, width: "100%", marginTop: 2}}>
              <img src={AllAllowed} style={{height: 20}} />
            </div>}
            <div className="col-10">{e.name}</div>
          </div>
        );
      })}
    </NonCollapsibleBaseCard>
  </div>
);

export default connect()(LegendsCard);
