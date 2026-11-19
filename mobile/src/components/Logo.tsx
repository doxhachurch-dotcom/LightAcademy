import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

/** Logo Light Academy : carré bleu, « L » blanc (comme le CRM web). */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#3A6AF4" />
          <Stop offset="1" stopColor="#1F46C9" />
        </LinearGradient>
      </Defs>
      <Rect x="24" y="24" width="464" height="464" rx="120" fill="url(#g)" />
      <SvgText x="256" y="352" textAnchor="middle" fontFamily="Inter_700Bold" fontWeight="700" fontSize="270" fill="#fff">
        L
      </SvgText>
    </Svg>
  );
}
