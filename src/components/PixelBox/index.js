import React, { useState, useEffect } from 'react';
import { directions } from '../../utils/common';
import './index.scss';

const renderClassName = (props) => {
    const wallClassName = directions.map(direction => {
        return `${props[`${direction}Wall`] ? `${direction}-wall` : ''}`
    }).join(' ');

    const visitedClassName = props.visited ? 'visited' : '';
    const isPath = props.isPath ? 'is-path' : '';

    return `pixel-box ${isPath} ${visitedClassName} ${wallClassName}`
}

const PixelBox = ({
    topWall, 
    rightWall, 
    bottomWall, 
    leftWall, 
    visited, 
    size,
    isPath,
    onClick
}) => {
    const [ className, setClassName ] = useState('pixel-box');

    useEffect(() => {
        const newClassName = renderClassName({
            topWall,
            rightWall,
            bottomWall,
            leftWall,
            visited,
            isPath
        })

        // if(isPath){
            console.log(1114, isPath)
        // }
        setClassName(newClassName)
    }, [topWall, rightWall, bottomWall, leftWall, isPath, setClassName])

    return (
        <div 
            className={className} 
            style={{width: size, height: size}}
            onClick={onClick}
        />
    )
}

export default PixelBox