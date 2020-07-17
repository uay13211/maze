import React, { useState, useEffect } from 'react';
import PixelBox from '../PixelBox'
import { Box, randomSelect, directions, findShortestPath } from '../../utils/common'
import './index.scss';

const Maze = ({
    size,
    axis
}) => {
    const [boxs, setBoxs] = useState({})
    const [startingPoint, setStartingPoint] = useState(null)
    const [endPoint, setEndPoint] = useState(null)

    useEffect(() => {
        initPixelBox();
    }, [])

    useEffect(() => {
        if(startingPoint && endPoint) {
            const pathedBoxs = findShortestPath(startingPoint, endPoint, boxs);
            setBoxs(pathedBoxs)
        }
    }, [startingPoint, endPoint])

    const onBoxClick = (id) => {
        if(!startingPoint) {
            return setStartingPoint(id)
        }

        if(id === startingPoint) return

        setEndPoint(id)
    }

    const getRandomBoxId = (boxs) => {
        const selectedBox = boxs[randomSelect(Object.keys(boxs))]
        
        return selectedBox
    }

    const initPath = (boxs) => {
        const startedBox = getRandomBoxId(boxs)

        return startedBox.visitNext(boxs)
    }

    const pixelBoxSize = () => {
        return (size / axis)
    }

    const initPixelBox = () => {
        let initBoxs = {};

        for(let i = 0; i < axis; i++) {
            for(let j = 0; j < axis; j++) {
                const boxId = `x-${j}-y-${i}`
                const topBoxId = (i - 1) < 0 ? null : `x-${j}-y-${i - 1}`
                const rightBoxId = (j + 1) > (axis - 1) ? null : `x-${j + 1}-y-${i}`
                const bottomBoxId = (i + 1) > (axis - 1) ? null : `x-${j}-y-${i + 1}`
                const leftBoxId = (j - 1) < 0 ? null : `x-${j - 1}-y-${i}`

                initBoxs[`x-${j}-y-${i}`] = new Box({
                    id: boxId,
                    size: pixelBoxSize(),
                    topBoxId,
                    rightBoxId,
                    bottomBoxId,
                    leftBoxId
                })
            }
        }
        
        setBoxs(initPath(initBoxs));
    }

    if(Object.keys(boxs).length === 0) return null

    return (
        <div id='maze' style={{ width: size, height: size }}>
            {Object.values(boxs).map(({ id, size, isPath, visited, topWall, rightWall, bottomWall, leftWall, }, idx) => {
                if(isPath){
                    console.log(1113, id)
                }
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
                )
            })}
        </div>
    )
}

export default Maze