/**
 * Ícones de traço. A geometria vem do HTML de referência (lápis, check, cronômetro)
 * e de `screens/01-inicio.png` (imagem do placeholder: ícone "image" de 24 px,
 * traço 2, que medido no PNG ocupa 28 de 34 pt).
 */
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

interface IconProps {
  size: number;
  color: string;
  strokeWidth: number;
}

/** Lápis do StatItem — viewBox 24. */
export function PencilIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20h4L19 9l-4-4L4 16z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Check do ExerciseCheck e do banner — viewBox 14. */
export function CheckIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Polyline
        points="2.5,7.5 5.8,10.5 11.5,3.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Cronômetro do RestToast — viewBox 24. */
export function StopwatchIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={12} y1={13} x2={12} y2={9} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={10} y1={2.5} x2={14} y2={2.5} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Imagem do placeholder da mídia — viewBox 24, traço 2. */
export function ImageIcon({ size, color }: Omit<IconProps, 'strokeWidth'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Circle cx={8.5} cy={8.5} r={1.5} stroke={color} strokeWidth={2} />
      <Polyline points="21 15 16 10 5 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
