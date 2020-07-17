import React, { useState, useEffect, useCallback } from "react";
import { directions } from "../../utils/common";
import "./index.scss";

const PixelBox = (props) => {
  const [className, setClassName] = useState("pixel-box");

  useEffect(() => {
    renderClassName();
  }, [
    props.topWall,
    props.rightWall,
    props.bottomWall,
    props.leftWall,
    props.isPath,
  ]);

  const renderClassName = useCallback(() => {
    const wallClassName = directions
      .map((direction) => {
        return `${props[`${direction}Wall`] ? `${direction}-wall` : ""}`;
      })
      .join(" ");

    const visitedClassName = props.visited ? "visited" : "";
    const isPath = props.isPath ? "is-path" : "";

    setClassName(`pixel-box ${isPath} ${visitedClassName} ${wallClassName}`);
  }, [
    props.topWall,
    props.rightWall,
    props.bottomWall,
    props.leftWall,
    props.isPath,
  ]);

  return (
    <div
      className={className}
      style={{ width: props.size, height: props.size }}
      onClick={props.onClick}
    />
  );
};

export default PixelBox;
