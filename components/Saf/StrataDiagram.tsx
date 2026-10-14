import { Box, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import { CitedText } from './Cite';
import { STRATA, STRATA_NOTE } from './content';

// Colores por estrato como variables CSS: cambian con `_dark` (la clase .dark
// del <html>) sin depender de un re-render, igual que en Elements/Logo.tsx.
const STRATUM_VARS = {
	'--stratum-emergente': 'var(--chakra-colors-green-900)',
	'--stratum-alto': 'var(--chakra-colors-green-700)',
	'--stratum-medio': 'var(--chakra-colors-green-500)',
	'--stratum-bajo': 'var(--chakra-colors-green-300)',
	'--stratum-trunk': '#8b5e3c',
	_dark: {
		'--stratum-emergente': 'var(--chakra-colors-green-200)',
		'--stratum-alto': 'var(--chakra-colors-green-400)',
		'--stratum-medio': 'var(--chakra-colors-green-600)',
		'--stratum-bajo': 'var(--chakra-colors-green-800)',
		'--stratum-trunk': '#c4a484'
	}
};

const colorOf = (id: string) => `var(--stratum-${id})`;

const GUIDES = [
	{ y: 70, label: 'Emergente', labelY: 45 },
	{ y: 120, label: 'Alto', labelY: 95 },
	{ y: 170, label: 'Medio', labelY: 145 },
	{ y: 225, label: 'Bajo', labelY: 200 }
];

function Tree({
	x,
	top,
	canopyY,
	rx,
	ry,
	fill,
	trunk = 8
}: {
	x: number;
	top: number;
	canopyY: number;
	rx: number;
	ry: number;
	fill: string;
	trunk?: number;
}) {
	return (
		<g>
			<rect x={x - trunk / 2} y={top} width={trunk} height={225 - top} rx={trunk / 3} style={{ fill: 'var(--stratum-trunk)' }} />
			<ellipse cx={x} cy={canopyY} rx={rx} ry={ry} style={{ fill }} />
		</g>
	);
}

function StrataSvg() {
	return (
		<svg viewBox="0 0 380 240" width="100%" role="img" aria-labelledby="estratos-svg-titulo estratos-svg-desc" style={{ display: 'block' }}>
			<title id="estratos-svg-titulo">Perfil de un sistema agroforestal por estratos</title>
			<desc id="estratos-svg-desc">
				Vista lateral con cuatro capas: una copa emergente por encima de todo, dos árboles del estrato alto, cuatro arbustos del estrato medio y seis
				plantas del estrato bajo cerca del suelo.
			</desc>

			{GUIDES.slice(0, 3).map(guide => (
				<line
					key={guide.y}
					x1={0}
					x2={295}
					y1={guide.y}
					y2={guide.y}
					style={{ stroke: 'var(--chakra-colors-border-emphasized)' }}
					strokeDasharray="4 4"
					strokeWidth={1}
				/>
			))}

			{/* Emergente */}
			<Tree x={150} top={55} canopyY={42} rx={40} ry={22} fill={colorOf('emergente')} trunk={9} />
			{/* Alto */}
			<Tree x={62} top={105} canopyY={92} rx={36} ry={20} fill={colorOf('alto')} />
			<Tree x={240} top={105} canopyY={92} rx={36} ry={20} fill={colorOf('alto')} />
			{/* Medio */}
			{[28, 108, 192, 272].map(x => (
				<Tree key={x} x={x} top={155} canopyY={146} rx={22} ry={15} fill={colorOf('medio')} trunk={5} />
			))}
			{/* Bajo */}
			{[14, 64, 118, 182, 234, 284].map(x => (
				<ellipse key={x} cx={x} cy={212} rx={15} ry={11} style={{ fill: colorOf('bajo') }} />
			))}

			<line x1={0} x2={295} y1={225} y2={225} style={{ stroke: 'var(--chakra-colors-fg-muted)' }} strokeWidth={2} />

			{GUIDES.map(guide => (
				<text
					key={guide.label}
					x={306}
					y={guide.labelY}
					fontSize={13}
					fontWeight={600}
					style={{ fill: 'var(--chakra-colors-fg-muted)' }}
					dominantBaseline="middle"
				>
					{guide.label}
				</text>
			))}
		</svg>
	);
}

export default function StrataDiagram() {
	return (
		<Stack gap={4}>
			<SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="center" css={STRATUM_VARS}>
				<Box borderWidth="1px" borderColor="border" rounded="xl" p={{ base: 3, md: 4 }} bg="bg.subtle">
					<StrataSvg />
				</Box>

				<Stack as="ul" gap={4} listStyleType="none" m={0} p={0}>
					{STRATA.map(stratum => (
						<Box as="li" key={stratum.id}>
							<Flex justify="space-between" align="baseline" gap={2} mb={1}>
								<Flex align="center" gap={2}>
									<Box w={3} h={3} rounded="full" flexShrink={0} style={{ background: colorOf(stratum.id) }} />
									<Text fontWeight="bold">{stratum.name}</Text>
								</Flex>
								<Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">
									≈ {stratum.occupation} % del terreno
								</Text>
							</Flex>
							<Box
								h={2}
								rounded="full"
								bg="bg.muted"
								overflow="hidden"
								role="meter"
								aria-label={`Ocupación aproximada del estrato ${stratum.name.toLowerCase()}`}
								aria-valuenow={stratum.occupation}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								<Box h="full" rounded="full" style={{ width: `${stratum.occupation}%`, background: colorOf(stratum.id) }} />
							</Box>
							<Text fontSize="sm" mt={1.5}>
								{stratum.description}{' '}
								<Text as="span" color="fg.muted">
									{stratum.examples}
								</Text>
							</Text>
						</Box>
					))}
				</Stack>
			</SimpleGrid>

			<CitedText paragraph={STRATA_NOTE} fontSize="sm" color="fg.muted" />
		</Stack>
	);
}
