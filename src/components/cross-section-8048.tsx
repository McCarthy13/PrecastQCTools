import { useMemo } from 'react';

type StrandSize = '3/8' | '1/2' | '0.6';

export interface StrandSlippageData {
  strandId: string;
  leftSlippage: string;
  rightSlippage: string;
  leftExceedsOne: boolean;
  rightExceedsOne: boolean;
  size?: StrandSize;
}

export interface StrandCoordinate {
  x: number;
  y: number;
}

export interface CrossSection8048Props {
  scale?: number;
  highlightedStrand?: number | null;
  activeStrands?: number[];
  offcutSide?: 'L1' | 'L2' | null;
  productWidth?: number;
  slippages?: StrandSlippageData[];
  showSlippageValues?: boolean;
  strandCoordinates?: StrandCoordinate[];
}

const FULL_WIDTH = 48;
const HEIGHT = 8;

const DEFAULT_STRANDS: Array<{ id: number; x: number; y: number }> = [
  { id: 1, x: 2, y: 2.125 },
  { id: 2, x: 9.125, y: 2.125 },
  { id: 3, x: 16.5625, y: 2.125 },
  { id: 4, x: 24, y: 2.125 },
  { id: 5, x: 31.4375, y: 2.125 },
  { id: 6, x: 38.875, y: 2.125 },
  { id: 7, x: 46, y: 2.125 },
];

const CORE_COUNT = 6;
const CORE_WIDTH = 5.5;
const CORE_HEIGHT = 5.625;
const EDGE_TO_FIRST_CORE = 2.625;
const CORE_SPACING = 1.9375;

export function CrossSection8048({
  scale = 10,
  highlightedStrand = null,
  activeStrands,
  offcutSide = null,
  productWidth,
  strandCoordinates,
  showSlippageValues = false,
  slippages = [],
}: CrossSection8048Props) {
  const greaterThanOneLabel = '\u003e1″';
  const width = productWidth ?? FULL_WIDTH;
  const padding = 16;
  const svgWidth = width * scale + padding * 2;
  const svgHeight = HEIGHT * scale + padding * 2 + (showSlippageValues ? 40 : 0);

  const xOffset = useMemo(() => {
    if (!productWidth || !offcutSide) return 0;
    if (offcutSide === 'L1') {
      return (FULL_WIDTH - productWidth) * scale;
    }
    return 0;
  }, [productWidth, offcutSide, scale]);

  const strandPositions = useMemo(() => {
    const base = strandCoordinates
      ? strandCoordinates.map((coord, index) => ({ id: index + 1, ...coord }))
      : DEFAULT_STRANDS;

    return base
      .map((strand) => {
        const displayX = strand.x * scale - xOffset + padding;
        const displayY = svgHeight - padding - strand.y * scale;
        const isActive = activeStrands ? activeStrands.includes(strand.id) : true;
        const isHighlighted = highlightedStrand === strand.id;
        return {
          ...strand,
          displayX,
          displayY,
          isActive,
          isHighlighted,
        };
      })
      .filter((strand) => strand.displayX >= padding && strand.displayX <= svgWidth - padding);
  }, [scale, strandCoordinates, xOffset, padding, svgHeight, highlightedStrand, activeStrands, svgWidth]);

  const coreRects = useMemo(() => {
    return Array.from({ length: CORE_COUNT }).map((_, index) => {
      const coreX = (EDGE_TO_FIRST_CORE + index * (CORE_WIDTH + CORE_SPACING)) * scale - xOffset + padding;
      const coreWidth = CORE_WIDTH * scale;
      const coreHeight = CORE_HEIGHT * scale;
      const y = svgHeight - padding - coreHeight - 1.1875 * scale; // bottom flange offset
      return {
        x: coreX,
        y,
        width: coreWidth,
        height: coreHeight,
      };
    }).filter((core) => core.x + core.width >= padding && core.x <= svgWidth - padding);
  }, [scale, xOffset, padding, svgHeight, svgWidth]);

  const slippageLookup = useMemo(() => {
    const map = new Map<string, StrandSlippageData>();
    slippages.forEach((entry) => map.set(entry.strandId, entry));
    return map;
  }, [slippages]);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      role="img"
      aria-label="8048 hollow core plank cross section"
    >
      <title>8048 Hollow Core Plank</title>
      <rect
        x={padding}
        y={padding}
        width={width * scale}
        height={HEIGHT * scale}
        fill="#f5f5f5"
        stroke="#d4d4d4"
        strokeWidth={2}
        rx={8}
        ry={8}
      />

      {coreRects.map((core, index) => (
        <rect
          key={`core-${index}`}
          x={core.x}
          y={core.y}
          width={core.width}
          height={core.height}
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth={1}
          opacity={0.9}
        />
      ))}

      {strandPositions.map((strand) => {
        const slippage = slippageLookup.get(String(strand.id));
        const radius = 0.6 * scale;
        const fill = strand.isHighlighted
          ? '#f97316'
          : strand.isActive
          ? '#ef4444'
          : '#94a3b8';

        return (
          <g key={strand.id}>
            <circle
              cx={strand.displayX}
              cy={strand.displayY}
              r={radius}
              fill={fill}
              opacity={strand.isActive ? 1 : 0.35}
              stroke="#1f2937"
              strokeWidth={strand.isHighlighted ? 2 : 1}
            />
            <text
              x={strand.displayX}
              y={strand.displayY + 4}
              textAnchor="middle"
              fontSize={10}
              fill="#ffffff"
              fontWeight="bold"
            >
              {strand.id}
            </text>
            {showSlippageValues && slippage && (
              <text
                x={strand.displayX}
                y={strand.displayY + radius + 14}
                textAnchor="middle"
                fontSize={10}
                fill="#475569"
              >
                E1 {slippage.leftExceedsOne ? greaterThanOneLabel : slippage.leftSlippage}
              </text>
            )}
            {showSlippageValues && slippage && (
              <text
                x={strand.displayX}
                y={strand.displayY + radius + 26}
                textAnchor="middle"
                fontSize={10}
                fill="#475569"
              >
                E2 {slippage.rightExceedsOne ? greaterThanOneLabel : slippage.rightSlippage}
              </text>
            )}
          </g>
        );
      })}

      {offcutSide && productWidth && (
        <text
          x={padding + width * scale / 2}
          y={padding - 6}
          textAnchor="middle"
          fontSize={10}
          fill="#475569"
        >
          {`${productWidth}″ • Cut side: ${offcutSide}`}
        </text>
      )}
    </svg>
  );
}
