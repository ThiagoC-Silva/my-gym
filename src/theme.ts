/**
 * Tema do app, derivado de `design/tokens.json` em tempo de carga.
 *
 * Nada aqui é digitado à mão: o JSON é importado e convertido para o formato
 * que o React Native consome. Para mudar um valor, edite `design/tokens.json`.
 *
 * Conversões:
 * - `gradient.*`  CSS `linear-gradient(...)` → props do `expo-linear-gradient`
 *                 (`colors`, `locations`, `start`, `end`), com o ângulo CSS
 *                 convertido exatamente para a proporção da caixa.
 * - `shadow.*`    CSS `box-shadow` → `BoxShadowValue[]` do RN ≥ 0.76
 *                 (camadas na mesma ordem, `inset` preservado).
 * - `font.*`      peso → família por peso (Android ignora `fontWeight` em fonte
 *                 custom); `tracking` em `em` → `letterSpacing` em pt;
 *                 `lineHeight` multiplicador → pt.
 * - `motion.*`    `cubic-bezier(...)` e palavras-chave CSS → tupla de bezier;
 *                 `translateY(130%)` → fração 1.3.
 */
import tokens from '../design/tokens.json';

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

/** Normaliza `rgba(0,0,0,.45)` → `rgba(0,0,0,0.45)` (forma aceita em toda plataforma). */
function normalizeColor(c: string): string {
  return c.replace(/(^|[^\d])\.(\d)/g, (_, pre: string, d: string) => `${pre}0.${d}`).replace(/\s+/g, '');
}

export const color = tokens.color;

// ---------------------------------------------------------------------------
// Degradês
// ---------------------------------------------------------------------------

export type GradientColors = readonly [string, string, ...string[]];
export type GradientLocations = readonly [number, number, ...number[]];

export interface Gradient {
  /** Ângulo CSS em graus (0 = para cima, 90 = para a direita, sentido horário). */
  angle: number;
  colors: GradientColors;
  locations: GradientLocations;
}

export interface GradientProps {
  colors: GradientColors;
  locations: GradientLocations;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

function parseGradient(css: string): Gradient {
  const m = /^linear-gradient\((.*)\)$/.exec(css.trim());
  if (!m) throw new Error(`theme: degradê inválido: ${css}`);
  const parts = m[1].split(/,(?![^(]*\))/).map((s) => s.trim());
  const angleMatch = /^(-?[\d.]+)deg$/.exec(parts[0]);
  if (!angleMatch) throw new Error(`theme: degradê sem ângulo em deg: ${css}`);
  const angle = Number(angleMatch[1]);

  const stops = parts.slice(1).map((s) => {
    const sm = /^(.+?)(?:\s+([\d.]+)%)?$/.exec(s)!;
    return { color: normalizeColor(sm[1]), pos: sm[2] === undefined ? undefined : Number(sm[2]) / 100 };
  });
  if (stops.length < 2) throw new Error(`theme: degradê com menos de 2 cores: ${css}`);

  // Regra do CSS: primeira parada sem posição = 0, última = 1, as do meio
  // sem posição são distribuídas igualmente entre as vizinhas conhecidas.
  const pos = stops.map((s) => s.pos);
  if (pos[0] === undefined) pos[0] = 0;
  if (pos[pos.length - 1] === undefined) pos[pos.length - 1] = 1;
  for (let i = 1; i < pos.length - 1; i++) {
    if (pos[i] !== undefined) continue;
    let j = i;
    while (pos[j] === undefined) j++;
    const a = pos[i - 1]!;
    const b = pos[j]!;
    for (let k = i; k < j; k++) pos[k] = a + ((b - a) * (k - i + 1)) / (j - i + 1);
  }

  return {
    angle,
    colors: stops.map((s) => s.color) as unknown as GradientColors,
    locations: pos as unknown as GradientLocations,
  };
}

/**
 * Props para `<LinearGradient>` reproduzindo o `linear-gradient(<ângulo>deg, …)` do CSS.
 *
 * O CSS estende a linha do degradê até os cantos da caixa, então os pontos dependem
 * da proporção. `aspect` = largura / altura do elemento (1 para quadrados/círculos).
 */
export function gradientProps(g: Gradient, aspect = 1): GradientProps {
  const rad = (g.angle * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const w = aspect;
  const h = 1;
  const half = (Math.abs(w * sin) + Math.abs(h * cos)) / 2;
  const r = (v: number) => Math.round(v * 1e4) / 1e4;
  return {
    colors: g.colors,
    locations: g.locations,
    start: { x: r((w / 2 - sin * half) / w), y: r((h / 2 + cos * half) / h) },
    end: { x: r((w / 2 + sin * half) / w), y: r((h / 2 - cos * half) / h) },
  };
}

type GradientName = keyof typeof tokens.gradient;

export const gradient = Object.fromEntries(
  Object.entries(tokens.gradient).map(([k, v]) => [k, parseGradient(v)]),
) as Record<GradientName, Gradient>;

// ---------------------------------------------------------------------------
// Sombras
// ---------------------------------------------------------------------------

export interface ShadowLayer {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadDistance: number;
  color: string;
  inset: boolean;
}

function parseShadow(css: string): ShadowLayer[] {
  return css.split(/,(?![^(]*\))/).map((layer) => {
    let s = layer.trim();
    const inset = /^inset\s+/.test(s);
    if (inset) s = s.replace(/^inset\s+/, '');
    const cm = /(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})$/.exec(s);
    if (!cm) throw new Error(`theme: sombra sem cor: ${layer}`);
    const nums = s
      .slice(0, cm.index)
      .trim()
      .split(/\s+/)
      .map((n) => Number(n.replace(/px$/, '')));
    if (nums.length < 2 || nums.some(Number.isNaN)) throw new Error(`theme: sombra inválida: ${layer}`);
    const [offsetX, offsetY, blurRadius = 0, spreadDistance = 0] = nums;
    return { offsetX, offsetY, blurRadius, spreadDistance, color: normalizeColor(cm[1]), inset };
  });
}

type ShadowName = keyof typeof tokens.shadow;

/**
 * Cada sombra como lista de camadas, pronta para `style={{ boxShadow: shadow.raised }}`.
 * Neumórficas têm sempre duas camadas (escura + realce) — nunca remover uma.
 */
export const shadow = Object.fromEntries(
  Object.entries(tokens.shadow).map(([k, v]) => [k, parseShadow(v)]),
) as Record<ShadowName, ShadowLayer[]>;

/** Uma camada de sombra como `text-shadow` do RN (sem spread nem inset). */
export function textShadow(layer: ShadowLayer) {
  return {
    textShadowColor: layer.color,
    textShadowOffset: { width: layer.offsetX, height: layer.offsetY },
    textShadowRadius: layer.blurRadius,
  };
}

// ---------------------------------------------------------------------------
// Medidas
// ---------------------------------------------------------------------------

export const radius = tokens.radius;
export const space = tokens.space;
export const size = tokens.size;
export const edit = tokens.edit;

const { _fonte, _fonteTela, ...componentTokens } = tokens.component;
/** Medidas específicas de cada componente (de COMPONENTS.md / referência), agrupadas por componente. */
export const component = componentTokens;

// ---------------------------------------------------------------------------
// Tipografia
// ---------------------------------------------------------------------------

/**
 * Nome de cada arquivo de fonte carregado com `useFonts` (pacotes
 * `@expo-google-fonts/poppins` e `@expo-google-fonts/jetbrains-mono`).
 * O mapeamento de peso → nome segue a convenção desses pacotes.
 */
export const fontFiles = {
  sans: {
    400: 'Poppins_400Regular',
    500: 'Poppins_500Medium',
    600: 'Poppins_600SemiBold',
    700: 'Poppins_700Bold',
    800: 'Poppins_800ExtraBold',
  },
  mono: {
    500: 'JetBrainsMono_500Medium',
  },
} as const;

type Family = keyof typeof fontFiles;

function fontFamily(family: Family, weight: number): string {
  const files = fontFiles[family] as Record<number, string>;
  const f = files[weight];
  if (!f) throw new Error(`theme: sem arquivo de fonte para ${family} ${weight}`);
  return f;
}

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
  /** Android: sem o padding extra de fonte, a caixa de linha fica igual à do CSS. */
  includeFontPadding: false;
}

interface RawFont {
  family?: string;
  weight: number;
  size: number;
  lineHeight?: number;
  tracking?: string;
  transform?: string;
}

function textStyle(raw: RawFont, weight = raw.weight): TextStyleToken {
  const family: Family = raw.family === 'mono' ? 'mono' : 'sans';
  const st: TextStyleToken = { fontFamily: fontFamily(family, weight), fontSize: raw.size, includeFontPadding: false };
  // Sem lineHeight no token vale a altura "normal" do CSS para a fonte.
  const lh = raw.lineHeight ?? tokens.font.lineHeightNormal[family];
  st.lineHeight = Math.round(raw.size * lh * 100) / 100;
  if (raw.tracking !== undefined) {
    const em = /^(-?[\d.]+)em$/.exec(raw.tracking);
    if (!em) throw new Error(`theme: tracking deve estar em em: ${raw.tracking}`);
    st.letterSpacing = Math.round(Number(em[1]) * raw.size * 100) / 100;
  }
  if (raw.transform === 'uppercase') st.textTransform = 'uppercase';
  return st;
}

const { family: _family, lineHeightNormal: _lhn, _lineHeightNormal: _lhnDoc, tab: rawTab, ...rawStyles } = tokens.font;

type TextStyleName = keyof typeof rawStyles | 'tab' | 'tabActive';

export const text = {
  ...Object.fromEntries(Object.entries(rawStyles).map(([k, v]) => [k, textStyle(v as RawFont)])),
  tab: textStyle(rawTab),
  tabActive: textStyle(rawTab, rawTab.weightActive),
} as Record<TextStyleName, TextStyleToken>;

// ---------------------------------------------------------------------------
// Movimento
// ---------------------------------------------------------------------------

/** Pontos de controle de `cubic-bezier(x1, y1, x2, y2)` — usar com `Easing.bezier(...b)`. */
export type Bezier = readonly [number, number, number, number];

/** Palavras-chave do CSS, com os valores da especificação. */
const cssKeywords: Record<string, Bezier> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

function parseBezier(css: string): Bezier {
  const m = /^cubic-bezier\(([^)]*)\)$/.exec(css.trim());
  if (!m) throw new Error(`theme: easing inválido: ${css}`);
  const n = m[1].split(',').map((v) => Number(v.trim()));
  if (n.length !== 4 || n.some(Number.isNaN)) throw new Error(`theme: easing inválido: ${css}`);
  return [n[0], n[1], n[2], n[3]];
}

type EasingName = keyof typeof tokens.motion.easing;

export const easing = Object.fromEntries(
  Object.entries(tokens.motion.easing).map(([k, v]) => [k, parseBezier(v)]),
) as Record<EasingName, Bezier>;

function resolveEasing(name: string): Bezier {
  if (name in easing) return easing[name as EasingName];
  if (name in cssKeywords) return cssKeywords[name];
  throw new Error(`theme: easing desconhecido: ${name}`);
}

function parseTranslateY(css: string): number {
  const m = /^translateY\((-?[\d.]+)%\)$/.exec(css);
  if (!m) throw new Error(`theme: transform não suportado: ${css}`);
  return Number(m[1]) / 100;
}

const { easing: _easing, ...rawMotion } = tokens.motion;

type RawMotion = (typeof rawMotion)[keyof typeof rawMotion];
type MotionName = keyof typeof rawMotion;

/**
 * Cada animação com `easing` resolvido para tupla de bezier e, quando houver,
 * `fromTranslateY` como fração da própria altura (130% → 1.3).
 */
export type MotionToken<T> = Omit<T, 'easing' | 'from'> & {
  easing?: Bezier;
  fromTranslateY?: number;
};

function motionToken<T extends RawMotion>(raw: T): MotionToken<T> {
  const { easing: e, from, ...rest } = raw as T & { easing?: string; from?: string };
  const out = { ...rest } as MotionToken<T>;
  if (e !== undefined) out.easing = resolveEasing(e);
  if (from !== undefined) out.fromTranslateY = parseTranslateY(from);
  return out;
}

export const motion = Object.fromEntries(
  Object.entries(rawMotion).map(([k, v]) => [k, motionToken(v)]),
) as { [K in MotionName]: MotionToken<(typeof rawMotion)[K]> };

// ---------------------------------------------------------------------------

export const theme = {
  color,
  gradient,
  shadow,
  radius,
  space,
  size,
  component,
  text,
  easing,
  motion,
  edit,
  fontFiles,
} as const;

export type Theme = typeof theme;
export default theme;
