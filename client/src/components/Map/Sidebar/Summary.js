import React from "react";
import { connect } from "react-redux";
import NonCollapsibleBaseCard from "./NonCollapsibleBaseCard";
import BaseCard from "./BaseCard";
import { getParticularEntity,getStorableCoordinatesCount } from "utils/selectors";
import _ from "lodash";

const Summary = ({ chargerDict,ppsDict,elevatorDict,storables,zones }) => {
  const chargers = Object.entries(chargerDict).map(([, val]) => val);
    
    
  const ppses = Object.entries(ppsDict).map(([, val]) => val);
  const elevators = Object.entries(elevatorDict).map(([, val]) => val);
  const title = "Summary";

  const entityMap = [
    {name : "Chargers" ,count : chargers.length,isCollapsible : true,entity : chargers },
    {name : "Ppses"  , count : ppses.length,isCollapsible : true, entity : ppses  },
    {name : "Elevators"  ,count : elevators.length,isCollapsible : true, entity : elevators }
  ];
  
  
  
  
  const NonCollapsibleEntityMap   =  [  {name:  "Storables" , count : storables, isCollapsible : false, entity :{} },
    { name :"Zones" , count : Object.keys(zones).length,isCollapsible : false , entity : {}}
  ];
  
  


  const typEntityMap = entityMap.map((e) => {e.typeInfo = GetTypeInformationUsingEntity(e.entity,e.name);return e;});



  const typeJsx = (typeObject) => 
  {
    const newArray = Object.entries(typeObject).map(
      (t,idx) => 
      {
        return (<p key = {idx} style={{marginBottom : "1%" }}> {t[0]} : {t[1]} </p>);
      }
    );
    return newArray;
            
  };
        
  const entityJsx = typEntityMap.map(
    (entry,idx) => 
    {
        
    
      return (
        <BaseCard key = {idx} title={entry.name + " : " +entry.count} isCollapsible = {entry.isCollapsible}> 
          {typeJsx(entry.typeInfo)}
        </BaseCard>
        
      );
    }
  );

  return (
    <div className="pt-3">
      <h4 className="menu-title">{title}</h4>
      {
        <NonCollapsibleBaseCard title={title}>  
          {entityJsx}
          {NonCollapsibleEntityMap.map((e,idx) => {return <p key = {idx} style={{marginLeft : "15%" }}> {e.name} : {e.count} </p>;  })}
        </NonCollapsibleBaseCard>
      }
    </div>
  ); 
};
  
export const GetTypeInformationUsingEntity = (entity,name) => 

{   var grouped;
  if (name != "Chargers"){
    grouped = _.mapValues(_.groupBy(entity, "type"),
      (elist) => {return elist.length;});
  }
  else {
    grouped = _.mapValues(_.groupBy(entity, "charger_type"),
      (elist) => {return elist.length;});
  }
  return grouped;
};




export default connect(state => ({
  chargerDict: getParticularEntity(state, { entityName: "charger" }),
  ppsDict : getParticularEntity(state, { entityName: "pps" }),
  elevatorDict : getParticularEntity(state, { entityName: "elevator" }),
  storables : getStorableCoordinatesCount(state),
  zones : getParticularEntity(state,{ entityName: "zone" })
}))(Summary);









