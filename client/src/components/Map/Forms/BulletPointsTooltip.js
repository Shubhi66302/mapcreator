import React from "react";
import ReactTooltip from "react-tooltip";

export default ({ id, title, bulletPoints }) =>
  title ? (
    <ReactTooltip id={id} effect="solid" delayShow={1000}>
      <div>
        <span>{title}</span>
        {bulletPoints && bulletPoints.length ? (
          <ul>
            {bulletPoints.map(bulletPoint => (
              <li>{bulletPoint}</li>
            ))}
          </ul>
        ) : (
          ""
        )}
      </div>
    </ReactTooltip>
  ) : (
    ""
  );
