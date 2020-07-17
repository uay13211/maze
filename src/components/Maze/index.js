import React, { useState, useEffect, useCallback } from "react";
import PixelBox from "../PixelBox";
import { Box, randomSelect, directions } from "../../utils/common";
import "./index.scss";

const Maze = ({ size, axis }) => {
  const [rawBoxs, setRawBoxs] = useState({});
  const [boxs, setBoxs] = useState({});
  const [startingPoint, setStartingPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  useEffect(() => {
    initPixelBox();
  }, []);

  useEffect(() => {
    if (startingPoint && endPoint) {
      findShortestPath();
    }
  }, [startingPoint, endPoint]);

  const onBoxClick = (id) => {
    if (!startingPoint) {
      return setStartingPoint(id);
    }

    if (id === startingPoint) return;

    setEndPoint(id);
  };

  const getRandomBoxId = (boxs) => {
    const selectedBox = boxs[randomSelect(Object.keys(boxs))];

    return selectedBox;
  };

  const initPath = (boxs) => {
    const startedBox = getRandomBoxId(boxs);

    return startedBox.visitNext(boxs);
  };

  const pixelBoxSize = () => {
    return size / axis;
  };

  const initPixelBox = () => {
    let initBoxs = {};

    for (let i = 0; i < axis; i++) {
      for (let j = 0; j < axis; j++) {
        const boxId = `x-${j}-y-${i}`;
        const topBoxId = i - 1 < 0 ? null : `x-${j}-y-${i - 1}`;
        const rightBoxId = j + 1 > axis - 1 ? null : `x-${j + 1}-y-${i}`;
        const bottomBoxId = i + 1 > axis - 1 ? null : `x-${j}-y-${i + 1}`;
        const leftBoxId = j - 1 < 0 ? null : `x-${j - 1}-y-${i}`;

        initBoxs[`x-${j}-y-${i}`] = new Box({
          id: boxId,
          size: pixelBoxSize(),
          topBoxId,
          rightBoxId,
          bottomBoxId,
          leftBoxId,
        });
      }
    }

    initBoxs = initPath(initBoxs);

    setBoxs(initBoxs);
    setRawBoxs(initBoxs);
  };

  const makePath = (boxId, newBoxs, currPrevList) => {
    newBoxs[boxId].initPath();
    const prevBoxId = currPrevList[boxId];

    return prevBoxId ? makePath(prevBoxId, newBoxs, currPrevList) : newBoxs;
  };

  const findShortestPath = useCallback(() => {
    let newBoxs = { ...rawBoxs };
    let currentBoxId = null;
    let frontierBoxsId = [startingPoint];
    let visitedBoxsId = [];
    let currPrevList = {
      startingPoint: null,
    };

    while (frontierBoxsId.length !== 0) {
      currentBoxId = frontierBoxsId[0];

      if (currentBoxId === endPoint) {
        setBoxs(makePath(endPoint, newBoxs, currPrevList));
        break;
      }

      const currentBox = newBoxs[currentBoxId];
      directions.forEach((direction) => {
        const isWall = currentBox[`${direction}Wall`];
        // isWall
        if (isWall) return;
        const nextBoxId = currentBox[`${direction}BoxId`];
        // outside
        if (!nextBoxId) return;
        // visited
        if (visitedBoxsId.find((id) => id === nextBoxId)) return;

        frontierBoxsId.push(nextBoxId);
        currPrevList[nextBoxId] = currentBoxId;
      });

      visitedBoxsId.push(currentBoxId);
      frontierBoxsId.shift();
    }
  }, [rawBoxs, startingPoint, endPoint]);

  if (Object.keys(boxs).length === 0) return null;

  return (
    <div id="maze" style={{ width: size, height: size }}>
      {Object.values(boxs).map(
        (
          {
            id,
            size,
            isPath,
            visited,
            topWall,
            rightWall,
            bottomWall,
            leftWall,
          },
          idx
        ) => {
          return (
            <PixelBox
              key={idx}
              size={size}
              visited={visited}
              topWall={topWall}
              rightWall={rightWall}
              bottomWall={bottomWall}
              leftWall={leftWall}
              onClick={() => onBoxClick(id)}
              isPath={isPath}
            />
          );
        }
      )}
    </div>
  );
};

export default Maze;
