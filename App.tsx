import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View, StyleSheet, PixelRatio } from 'react-native';
import { Skia, usePathInterpolation, Canvas, Path } from "@shopify/react-native-skia";
import { curveBasis, line, scaleLinear, scaleTime } from 'd3'
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const GRAPH_HEIGHT = 500
const GRAPH_WIDTH = 350

export const data1 = [
  { date: '2024-03-01T00:00:00Z', value: 100 },
  { date: '2024-03-15T00:00:00Z', value: 700 },
];

export const data2 = [
  { date: '2024-03-01T00:00:00Z', value: 700 },
  { date: '2024-03-15T00:00:00Z', value: 400 },
];

const makeGraph = (data: { date: string; value: number }[]) => {
  const max = Math.max(...data.map(val => val.value))
  const y = scaleLinear().domain([0, max]).range([GRAPH_HEIGHT, 35])
  const x = scaleTime().domain([new Date(2024, 2, 1), new Date(2024, 2, 15)]).range([10, GRAPH_WIDTH - 10]);

  const curvedPath = line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.value))
    .curve(curveBasis)(data)

  return Skia.Path.MakeFromSVGString(curvedPath!);
}

export default function App() {
  const progress = useSharedValue(0);

  const graphData = [makeGraph(data1), makeGraph(data2)]

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, {
      duration: 1000
    }), -1, true)
  
 
  }, [progress])
  
  const path = usePathInterpolation(
    progress,
    [0,1],
    [graphData[0], graphData[1]]
  )


  return (

    <Canvas style={{flex:1}}>
      <Path 
        path={path}
        style='stroke'
        strokeWidth={5}
        strokeCap='round'
        strokeJoin='round'
      
      />
    </Canvas>

  );
}

