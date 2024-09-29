import React, { useMemo, useRef, useEffect, useState } from 'react'
import { PixelRatio, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BackdropBlur, Canvas, Circle, Fill, Group, Image, makeImageFromView, mix, rect, rrect, vec,  } from '@shopify/react-native-skia';
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';


export const useLoop = ({ duration }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration, easing: Easing.inOut(Easing.
          ease)
      }),
      -1,
      true
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [duration, progress]);
  return progress;
};

const pd = PixelRatio.get();

export default function App() {

  const { width, height } = useWindowDimensions();
  const ref = useRef(null);


  const CARD_WIDTH = width - 60;
  const CARD_HEIGHT = CARD_WIDTH * 0.5;
  const ANIMATION_OFFSET = 50;

  const c = vec(width / 2, height / 2);
  const r = width * 0.33;

  const clip = useMemo(
    () => rrect(rect(0, 0, CARD_WIDTH, CARD_HEIGHT), 20, 20),
    [CARD_HEIGHT, CARD_WIDTH],
  );

  const progress = useLoop({ duration: 2000 });

  const x = useSharedValue((width - CARD_WIDTH) / 2);
  const y = useSharedValue((height - CARD_HEIGHT) / 2);

  const transform = useDerivedValue(() => [
    { translateY: y.value },
    { translateX: x.value },
  ]);

  const circleTranslate = useDerivedValue(
    () => mix(progress.value, c.y + ANIMATION_OFFSET, c.y -
      ANIMATION_OFFSET),
    [progress],
  );

  const [image, setImage] = useState(null);

  useEffect(() => {
    makeImageFromView(ref).then(snapshot =>
      setImage(snapshot));
  }, []);



  return (
    <>
      <View
        ref={ref}
        collapsable={false}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          ...StyleSheet.absoluteFill,
        }}>
        <View style={{
          height: 300, width: 300,
          backgroundColor: 'red'
        }} />
      </View>
      <Canvas style={{ flex: 1 }}>
        <Image
          image={image}
          x={0}
          y={0}
          height={(image?.height() || 0) / pd}
          width={(image?.width() || 0) / pd}
        />
        <Group>
          <Circle cx={r} cy={c.y} r={r} color="cyan" />
          <Circle cx={width - r} cy={circleTranslate} r={r} color="magenta" />
        </Group>
        <BackdropBlur
          blur={20} 
          transform={transform}
          clip={clip}
        >
          <Fill color='rgba(0, 0, 0, 0.3)' />
        </BackdropBlur>
      </Canvas>
    </>

  );
}

