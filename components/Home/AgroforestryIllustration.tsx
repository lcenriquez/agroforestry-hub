// Ilustración del banner: un corte de un sistema agroforestal con sus estratos
// (emergente, alto, medio, bajo y cobertura del suelo) sobre el suelo vivo.
//
// Todos los colores salen de variables CSS (`--saf-*`) que define HeroBanner
// con dos paletas (clara/oscura) alternadas por `_dark`, por la misma razón que
// en components/Elements/Logo.tsx: el modo se resuelve con la clase `.dark` del
// <html>, nunca con un hook. El cielo es transparente: el degradado lo pinta el
// contenedor, así el SVG se puede recortar (preserveAspectRatio="slice") sin
// dejar bordes.
//
// Las animaciones (vaivén de copas y hojas, nubes, estrellas) se apagan con
// `prefers-reduced-motion: reduce`.

import type { CSSProperties } from 'react';

const GROUND = 630;

const paint = (name: string): CSSProperties => ({ fill: `var(--saf-${name})` });
const stroke = (name: string, width: number): CSSProperties => ({
	fill: 'none',
	stroke: `var(--saf-${name})`,
	strokeWidth: width,
	strokeLinecap: 'round',
	strokeLinejoin: 'round'
});

type Blob = [number, number, number];
type Ellipse = [number, number, number, number];

function Blobs({ blobs, color, opacity }: { blobs: Blob[]; color: string; opacity?: number }) {
	return (
		<g style={paint(color)} opacity={opacity}>
			{blobs.map(([cx, cy, r]) => (
				<circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} />
			))}
		</g>
	);
}

function Ellipses({ items, color }: { items: Ellipse[]; color: string }) {
	return (
		<g style={paint(color)}>
			{items.map(([cx, cy, rx, ry]) => (
				<ellipse key={`${cx}-${cy}-${rx}`} cx={cx} cy={cy} rx={rx} ry={ry} />
			))}
		</g>
	);
}

function Trunk({ x, top, base = 18, tip = 10, flare = 8 }: { x: number; top: number; base?: number; tip?: number; flare?: number }) {
	const b = base / 2;
	const t = tip / 2;
	return (
		<g>
			<path
				d={`M${x - b - flare} ${GROUND + 2} Q${x - b} ${GROUND - 12} ${x - b + 1} ${GROUND - 50} L${x - t} ${top} L${x + t} ${top} L${x + b - 1} ${GROUND - 50} Q${x + b} ${GROUND - 12} ${x + b + flare} ${GROUND + 2} Z`}
				style={paint('trunk')}
			/>
			<path d={`M${x + t * 0.2} ${top} L${x + b * 0.35} ${GROUND - 20}`} style={stroke('trunk-dark', Math.max(2, tip * 0.35))} opacity={0.6} />
		</g>
	);
}

function Dots({ items, color, r = 6 }: { items: [number, number][]; color: string; r?: number }) {
	return (
		<g style={paint(color)}>
			{items.map(([cx, cy]) => (
				<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
			))}
		</g>
	);
}

function Maize({ x, h }: { x: number; h: number }) {
	const top = GROUND - h;
	const leaves = [0.25, 0.42, 0.58, 0.72].map((p, i) => {
		const y = GROUND - h * p;
		const dir = i % 2 === 0 ? 1 : -1;
		return `M${x} ${y} C${x + dir * 12} ${y - 14} ${x + dir * 24} ${y - 10} ${x + dir * 30} ${y + 4}`;
	});
	return (
		<g className="saf-sway saf-sway-fast" style={{ animationDelay: `${-(x % 5)}s` }}>
			<path d={`M${x} ${GROUND} L${x} ${top}`} style={stroke('low-dark', 3.5)} />
			{leaves.map(d => (
				<path key={d} d={d} style={stroke('low', 4)} />
			))}
			<path d={`M${x} ${top} l-6 -12 M${x} ${top} l0 -15 M${x} ${top} l6 -12`} style={stroke('flower', 2.5)} />
			<ellipse cx={x + 4} cy={GROUND - h * 0.5} rx={4} ry={9} style={paint('flower')} opacity={0.9} />
		</g>
	);
}

function Bean({ x, s = 1 }: { x: number; s?: number }) {
	return (
		<g>
			<Blobs
				color="cover"
				blobs={[
					[x - 10 * s, GROUND - 8 * s, 10 * s],
					[x + 8 * s, GROUND - 9 * s, 11 * s],
					[x, GROUND - 17 * s, 11 * s]
				]}
			/>
			<Blobs
				color="cover-hi"
				blobs={[
					[x - 3 * s, GROUND - 21 * s, 5 * s],
					[x + 9 * s, GROUND - 14 * s, 4 * s]
				]}
			/>
		</g>
	);
}

function Squash({ x }: { x: number }) {
	return (
		<g>
			<path d={`M${x - 40} ${GROUND - 2} Q${x - 10} ${GROUND - 12} ${x + 40} ${GROUND - 3}`} style={stroke('cover', 3)} />
			<Ellipses
				color="cover"
				items={[
					[x - 26, GROUND - 10, 15, 10],
					[x + 2, GROUND - 13, 17, 11],
					[x + 30, GROUND - 9, 14, 9]
				]}
			/>
			<Ellipses
				color="cover-hi"
				items={[
					[x - 2, GROUND - 17, 8, 4],
					[x - 28, GROUND - 13, 6, 3]
				]}
			/>
			<circle cx={x + 14} cy={GROUND - 22} r={6} style={paint('flower')} />
			<circle cx={x - 16} cy={GROUND - 20} r={4.5} style={paint('flower')} />
		</g>
	);
}

function Sapling({ x, h = 60 }: { x: number; h?: number }) {
	const top = GROUND - h;
	return (
		<g>
			<path d={`M${x + 9} ${GROUND} L${x + 9} ${top + 6}`} style={stroke('trunk-dark', 3)} opacity={0.8} />
			<path d={`M${x} ${GROUND} L${x} ${top + 10}`} style={stroke('trunk', 3.5)} />
			<g className="saf-sway saf-sway-fast" style={{ animationDelay: `${-(x % 4)}s` }}>
				<Blobs
					color="high"
					blobs={[
						[x, top, 15],
						[x - 11, top + 8, 10],
						[x + 11, top + 7, 10]
					]}
				/>
				<circle cx={x - 4} cy={top - 5} r={7} style={paint('high-hi')} />
			</g>
		</g>
	);
}

function Banana({ x, h, s = 1, delay = 0 }: { x: number; h: number; s?: number; delay?: number }) {
	const top = GROUND - h;
	const leaf = 'M0 0 C30 -34 95 -46 150 -16 C104 -12 48 -2 0 0 Z';
	const rib = 'M0 0 C40 -26 95 -34 150 -16';
	const leaves: { a: number; flip: boolean; dark: boolean }[] = [
		{ a: -38, flip: false, dark: true },
		{ a: -38, flip: true, dark: true },
		{ a: 8, flip: false, dark: false },
		{ a: 12, flip: true, dark: false },
		{ a: -70, flip: false, dark: false },
		{ a: 34, flip: false, dark: true }
	];
	return (
		<g>
			<path d={`M${x - 8 * s} ${GROUND} L${x - 5 * s} ${top} L${x + 5 * s} ${top} L${x + 8 * s} ${GROUND} Z`} style={paint('banana-stem')} />
			<path d={`M${x + 3 * s} ${top + 6} Q${x + 26 * s} ${top + 18} ${x + 30 * s} ${top + 58 * s}`} style={stroke('banana-stem', 3)} />
			<Ellipses
				color="fruit-green"
				items={[
					[x + 24 * s, top + 26 * s, 6 * s, 9 * s],
					[x + 33 * s, top + 28 * s, 6 * s, 9 * s],
					[x + 25 * s, top + 40 * s, 6 * s, 9 * s],
					[x + 35 * s, top + 42 * s, 6 * s, 9 * s]
				]}
			/>
			<ellipse cx={x + 30 * s} cy={top + 64 * s} rx={6 * s} ry={10 * s} style={paint('bud')} />
			<g className="saf-sway saf-sway-leaf" style={{ animationDelay: `${delay}s` }}>
				{leaves.map(({ a, flip, dark }) => (
					<g key={`${a}-${flip}`} transform={`translate(${x} ${top}) rotate(${flip ? -a : a}) scale(${flip ? -s : s} ${s})`}>
						<path d={leaf} style={paint(dark ? 'banana-dark' : 'banana')} />
						<path d={rib} style={stroke(dark ? 'banana' : 'banana-dark', 2)} opacity={0.7} />
					</g>
				))}
			</g>
		</g>
	);
}

function Pineapple({ x }: { x: number }) {
	const spikes = [-62, -40, -20, 0, 20, 40, 62];
	return (
		<g>
			{spikes.map(a => (
				<path
					key={a}
					d="M-5 0 L0 -40 L5 0 Z"
					transform={`translate(${x} ${GROUND}) rotate(${a})`}
					style={paint(Math.abs(a) > 30 ? 'low-dark' : 'low')}
				/>
			))}
			<ellipse cx={x} cy={GROUND - 30} rx={9} ry={12} style={paint('fruit')} />
			<path d={`M${x} ${GROUND - 42} l-6 -12 M${x} ${GROUND - 42} l0 -14 M${x} ${GROUND - 42} l6 -12`} style={stroke('low-dark', 3)} />
		</g>
	);
}

function Herb({ x, berries = false }: { x: number; berries?: boolean }) {
	return (
		<g>
			<Blobs
				color="low-dark"
				blobs={[
					[x - 10, GROUND - 12, 11],
					[x + 10, GROUND - 13, 12],
					[x, GROUND - 24, 13]
				]}
			/>
			<Blobs
				color="low"
				blobs={[
					[x - 4, GROUND - 28, 6],
					[x + 9, GROUND - 19, 5]
				]}
			/>
			{berries && (
				<Dots
					color="berry"
					r={3}
					items={[
						[x - 8, GROUND - 16],
						[x + 6, GROUND - 26],
						[x + 14, GROUND - 10]
					]}
				/>
			)}
		</g>
	);
}

// Estrellas deterministas (mismo resultado en el prerender y en el cliente).
const STARS: Blob[] = (() => {
	let seed = 7;
	const rand = () => {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
	return Array.from({ length: 46 }, () => [Math.round(rand() * 2400), Math.round(rand() * 380), Math.round((0.8 + rand() * 1.6) * 10) / 10] as Blob);
})();

const FIELD_ROWS = [604, 614, 623];

export default function AgroforestryIllustration() {
	return (
		<svg
			viewBox="0 0 2400 700"
			preserveAspectRatio="xMaxYMax slice"
			width="100%"
			height="100%"
			aria-hidden="true"
			focusable="false"
			style={{ display: 'block' }}
		>
			<defs>
				<radialGradient id="saf-hero-sun-glow">
					<stop offset="0" style={{ stopColor: 'var(--saf-sun-glow)', stopOpacity: 0.9 }} />
					<stop offset="0.45" style={{ stopColor: 'var(--saf-sun-glow)', stopOpacity: 0.35 }} />
					<stop offset="1" style={{ stopColor: 'var(--saf-sun-glow)', stopOpacity: 0 }} />
				</radialGradient>
				<linearGradient id="saf-hero-soil" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" style={{ stopColor: 'var(--saf-soil-top)' }} />
					<stop offset="1" style={{ stopColor: 'var(--saf-soil-bottom)' }} />
				</linearGradient>
				<linearGradient id="saf-hero-haze" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" style={{ stopColor: 'var(--saf-haze)', stopOpacity: 0 }} />
					<stop offset="0.6" style={{ stopColor: 'var(--saf-haze)', stopOpacity: 0.55 }} />
					<stop offset="1" style={{ stopColor: 'var(--saf-haze)', stopOpacity: 0 }} />
				</linearGradient>
				<linearGradient id="saf-hero-shade" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" style={{ stopColor: 'var(--saf-shade)', stopOpacity: 0 }} />
					<stop offset="1" style={{ stopColor: 'var(--saf-shade)', stopOpacity: 0.35 }} />
				</linearGradient>
			</defs>

			<style>{`
				@keyframes saf-sway { 0%, 100% { transform: rotate(-0.7deg); } 50% { transform: rotate(0.7deg); } }
				@keyframes saf-sway-leaf { 0%, 100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2deg); } }
				@keyframes saf-drift { from { transform: translateX(-60px); } to { transform: translateX(60px); } }
				@keyframes saf-twinkle { 0%, 100% { opacity: 0.9; } 50% { opacity: 0.35; } }
				.saf-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: saf-sway 8s ease-in-out infinite; }
				.saf-sway-fast { animation-duration: 5s; }
				.saf-sway-slow { animation-duration: 11s; }
				.saf-sway-leaf { animation-name: saf-sway-leaf; animation-duration: 6s; }
				.saf-drift { animation: saf-drift 38s ease-in-out infinite alternate; }
				.saf-drift-slow { animation-duration: 55s; animation-direction: alternate-reverse; }
				.saf-star { animation: saf-twinkle 4s ease-in-out infinite; }
				@media (prefers-reduced-motion: reduce) {
					.saf-sway, .saf-drift, .saf-star { animation: none !important; }
				}
			`}</style>

			{/* Cielo: sol (día) / luna y estrellas (noche) */}
			<g className="saf-day">
				<circle cx={1640} cy={175} r={210} fill="url(#saf-hero-sun-glow)" />
				<circle cx={1640} cy={175} r={58} style={paint('sun')} />
			</g>
			<g className="saf-night">
				{STARS.map(([cx, cy, r], i) => (
					<circle key={`${cx}-${cy}`} className="saf-star" cx={cx} cy={cy} r={r} fill="#fff" style={{ animationDelay: `${-(i % 7) * 0.6}s` }} />
				))}
				<circle cx={1640} cy={175} r={150} fill="url(#saf-hero-sun-glow)" />
				<circle cx={1640} cy={175} r={40} style={paint('sun')} />
				<circle cx={1626} cy={166} r={7} style={paint('sun-spot')} />
				<circle cx={1652} cy={190} r={5} style={paint('sun-spot')} />
				<circle cx={1650} cy={160} r={3.5} style={paint('sun-spot')} />
			</g>

			{/* Nubes */}
			<g style={paint('cloud')}>
				<g className="saf-drift">
					<g opacity={0.85}>
						<ellipse cx={760} cy={150} rx={95} ry={26} />
						<circle cx={720} cy={136} r={34} />
						<circle cx={775} cy={122} r={44} />
						<circle cx={825} cy={140} r={28} />
					</g>
					<g opacity={0.7}>
						<ellipse cx={2240} cy={92} rx={80} ry={20} />
						<circle cx={2210} cy={80} r={26} />
						<circle cx={2255} cy={70} r={34} />
					</g>
				</g>
				<g className="saf-drift saf-drift-slow" opacity={0.6}>
					<ellipse cx={1290} cy={250} rx={70} ry={16} />
					<circle cx={1270} cy={240} r={22} />
					<circle cx={1305} cy={232} r={26} />
				</g>
			</g>

			{/* Lomeríos lejanos y bruma */}
			<path
				d="M0 470 C200 430 400 440 600 462 S1000 418 1250 445 S1700 472 1950 432 S2300 418 2400 440 L2400 700 L0 700 Z"
				style={paint('hill-far')}
			/>
			<rect x={0} y={400} width={2400} height={160} fill="url(#saf-hero-haze)" />
			<path
				d="M0 540 C250 500 500 506 760 530 S1200 522 1450 500 S1900 522 2100 505 S2350 498 2400 510 L2400 700 L0 700 Z"
				style={paint('hill-mid')}
			/>
			<Blobs
				color="hill-near"
				opacity={0.9}
				blobs={[
					[90, 528, 14],
					[118, 524, 18],
					[150, 530, 11],
					[420, 510, 13],
					[446, 506, 17],
					[690, 524, 12],
					[712, 520, 15],
					[1010, 525, 16],
					[1040, 528, 11],
					[1240, 518, 13],
					[1262, 513, 17]
				]}
			/>

			{/* Bosque de fondo: da profundidad detrás de los estratos */}
			<Blobs
				color="forest-back"
				blobs={[
					[1300, 590, 26],
					[1326, 560, 34],
					[1356, 520, 42],
					[1360, 470, 40],
					[1410, 440, 52],
					[1470, 420, 58],
					[1540, 430, 50],
					[1600, 410, 56],
					[1670, 425, 52],
					[1740, 400, 60],
					[1810, 420, 55],
					[1880, 405, 58],
					[1950, 425, 54],
					[2020, 410, 56],
					[2090, 430, 52],
					[2160, 405, 58],
					[2230, 420, 55],
					[2300, 400, 60],
					[2370, 415, 58]
				]}
			/>
			<rect x={1380} y={440} width={1020} height={170} style={paint('forest-back')} />
			<path d="M1290 610 C1300 586 1330 560 1360 540 L1400 540 L1400 610 Z" style={paint('forest-back')} />

			{/* Terreno */}
			<path d="M0 596 C300 582 600 588 900 596 S1500 590 1800 596 S2200 592 2400 596 L2400 700 L0 700 Z" style={paint('field')} />
			{FIELD_ROWS.map((y, i) => (
				<path
					key={y}
					d={`M0 ${y} C300 ${y - 6} 700 ${y - 2} 1000 ${y + 1} S1300 ${y - 2} 1420 ${y}`}
					style={stroke('field-row', 3 + i)}
					opacity={0.8}
				/>
			))}

			{/* Estrato alto (fondo) */}
			<g className="saf-sway saf-sway-slow">
				<Trunk x={1480} top={300} base={20} tip={10} />
				<path d="M1480 360 Q1450 330 1430 310 M1482 340 Q1515 315 1535 300" style={stroke('trunk', 7)} />
				<Blobs
					color="high"
					blobs={[
						[1420, 300, 58],
						[1480, 250, 74],
						[1548, 292, 60],
						[1470, 322, 52],
						[1524, 332, 46]
					]}
				/>
				<Blobs
					color="high-hi"
					blobs={[
						[1452, 228, 38],
						[1512, 236, 30],
						[1410, 284, 26],
						[1556, 276, 22]
					]}
				/>
			</g>
			<g className="saf-sway saf-sway-slow" style={{ animationDelay: '-4s' }}>
				<Trunk x={2330} top={290} base={20} tip={10} />
				<Blobs
					color="high2"
					blobs={[
						[2270, 285, 56],
						[2335, 238, 70],
						[2400, 270, 66],
						[2320, 310, 52],
						[2380, 320, 44]
					]}
				/>
				<Blobs
					color="high2-hi"
					blobs={[
						[2310, 214, 36],
						[2365, 222, 28],
						[2262, 268, 24]
					]}
				/>
			</g>

			{/* Estrato emergente */}
			<g className="saf-sway saf-sway-slow" style={{ animationDelay: '-2s' }}>
				<Trunk x={2060} top={180} base={34} tip={14} flare={18} />
				<path d="M2058 238 Q2020 196 1975 166 M2062 226 Q2100 190 2150 166 M2060 200 L2060 130" style={stroke('trunk', 9)} />
				<Ellipses
					color="emergent"
					items={[
						[1958, 146, 86, 42],
						[2060, 108, 112, 54],
						[2164, 140, 92, 44],
						[2008, 168, 70, 30],
						[2118, 170, 74, 30]
					]}
				/>
				<Ellipses
					color="emergent-hi"
					items={[
						[2030, 86, 62, 26],
						[1946, 126, 46, 18],
						[2156, 116, 52, 20],
						[2092, 74, 34, 14]
					]}
				/>
			</g>

			{/* Estrato alto (frente) */}
			<g className="saf-sway" style={{ animationDelay: '-1s' }}>
				<Trunk x={1770} top={340} base={20} tip={10} />
				<path d="M1770 400 Q1740 370 1724 352 M1772 388 Q1800 366 1815 350" style={stroke('trunk', 6)} />
				<Blobs
					color="high"
					blobs={[
						[1720, 330, 46],
						[1770, 290, 60],
						[1825, 322, 48],
						[1770, 345, 44]
					]}
				/>
				<Blobs
					color="high-hi"
					blobs={[
						[1750, 270, 30],
						[1796, 276, 22],
						[1714, 316, 20]
					]}
				/>
				<Dots
					color="fruit"
					r={7}
					items={[
						[1740, 352],
						[1796, 346],
						[1812, 312],
						[1730, 322]
					]}
				/>
			</g>

			{/* Estrato medio: cítrico, plátanos, cacao, café */}
			<g className="saf-sway" style={{ animationDelay: '-3s' }}>
				<Trunk x={1600} top={480} base={14} tip={8} flare={5} />
				<Blobs
					color="mid"
					blobs={[
						[1570, 470, 36],
						[1605, 444, 44],
						[1638, 474, 34],
						[1600, 488, 32]
					]}
				/>
				<Blobs
					color="mid-hi"
					blobs={[
						[1590, 428, 22],
						[1620, 434, 16]
					]}
				/>
				<Dots
					color="fruit"
					items={[
						[1576, 458],
						[1612, 470],
						[1640, 456],
						[1596, 494],
						[1626, 492],
						[1562, 482]
					]}
				/>
			</g>
			<Banana x={1885} h={150} s={1} delay={-1} />

			<g className="saf-sway" style={{ animationDelay: '-5s' }}>
				<Trunk x={2000} top={530} base={13} tip={8} flare={5} />
				<Blobs
					color="mid"
					blobs={[
						[1970, 515, 30],
						[2000, 492, 36],
						[2032, 514, 30]
					]}
				/>
				<Blobs
					color="mid-hi"
					blobs={[
						[1988, 478, 18],
						[2014, 484, 13]
					]}
				/>
				<g style={paint('pod')}>
					<ellipse cx={1990} cy={570} rx={5.5} ry={10} transform="rotate(14 1990 570)" />
					<ellipse cx={2010} cy={586} rx={5.5} ry={10} transform="rotate(-12 2010 586)" />
					<ellipse cx={1992} cy={600} rx={5} ry={9} transform="rotate(10 1992 600)" />
				</g>
			</g>

			<Banana x={2250} h={120} s={0.8} delay={-3.5} />

			<g className="saf-sway saf-sway-fast" style={{ animationDelay: '-2s' }}>
				<path d="M2150 630 L2150 540 M2150 600 L2132 560 M2150 590 L2170 556" style={stroke('trunk', 4)} />
				<Ellipses
					color="mid"
					items={[
						[2150, 590, 40, 13],
						[2150, 566, 34, 12],
						[2150, 543, 26, 11],
						[2150, 524, 15, 9]
					]}
				/>
				<Ellipses
					color="mid-hi"
					items={[
						[2140, 584, 18, 5],
						[2142, 560, 14, 4],
						[2144, 538, 10, 4]
					]}
				/>
				<Dots
					color="berry"
					r={3.5}
					items={[
						[2128, 597],
						[2138, 599],
						[2166, 596],
						[2176, 594],
						[2134, 574],
						[2164, 573],
						[2146, 552],
						[2158, 551]
					]}
				/>
			</g>

			{/* Estrato bajo: maíz, piña, hierbas, arbolitos en sucesión */}
			{[1380, 1418, 1452].map((x, i) => (
				<Maize key={x} x={x} h={78 - i * 6} />
			))}
			<Herb x={1530} berries />
			<Pineapple x={1690} />
			<Herb x={1820} />
			<Pineapple x={1945} />
			<Herb x={2080} berries />
			<Herb x={2335} />

			{/* Parcela de cultivos (izquierda): milpa con árboles jóvenes */}
			{[160, 250, 340, 520, 610, 700, 880, 970, 1060, 1240, 1310].map((x, i) => (
				<Maize key={x} x={x} h={62 + ((i * 7) % 4) * 6} />
			))}
			<Sapling x={430} h={70} />
			<Sapling x={790} h={58} />
			<Sapling x={1150} h={78} />
			{[205, 295, 565, 655, 925, 1015, 1285].map((x, i) => (
				<Bean key={x} x={x} s={0.7 + (i % 3) * 0.1} />
			))}

			{/* Cobertura del suelo */}
			<Squash x={60} />
			<Squash x={475} />
			<Squash x={1195} />
			<Squash x={1570} />
			<Squash x={1910} />
			<Squash x={2200} />
			{[1350, 1475, 1640, 1730, 1860, 2030, 2120, 2290, 2380].map(x => (
				<Bean key={x} x={x} s={0.75} />
			))}

			{/* Suelo vivo: hojarasca, raíces y piedritas */}
			<path d="M0 632 C400 626 800 636 1200 630 S2000 626 2400 632 L2400 700 L0 700 Z" fill="url(#saf-hero-soil)" />
			<path d="M0 632 C400 626 800 636 1200 630 S2000 626 2400 632" style={stroke('litter', 5)} />
			<g style={stroke('root', 3)} opacity={0.55}>
				<path d="M2050 634 C2030 655 2000 664 1960 690 M2070 634 C2090 656 2130 668 2170 694 M2060 636 L2058 700 M2040 640 C2020 650 1990 650 1960 660 M2080 640 C2100 650 2130 648 2160 656" />
				<path d="M1476 634 C1462 650 1444 662 1420 680 M1486 634 C1500 652 1520 664 1548 678 M1480 636 L1482 690" />
				<path d="M1766 634 C1752 652 1736 664 1716 676 M1776 634 C1790 652 1806 662 1828 674" />
				<path d="M2326 634 C2312 652 2296 664 2276 680 M2336 634 C2350 650 2370 662 2400 672" />
				<path d="M1600 634 C1590 648 1580 656 1566 664 M1604 634 C1614 648 1624 656 1640 662" />
			</g>
			<g style={stroke('root', 1.5)} opacity={0.4}>
				<path d="M160 634 L156 652 M160 634 L166 650 M340 634 L336 650 M610 634 L614 652 M880 634 L876 650 M1060 634 L1064 650 M430 634 L428 660 M790 634 L792 656 M1150 634 L1148 662" />
			</g>
			<Ellipses
				color="pebble"
				items={[
					[120, 672, 7, 4],
					[380, 684, 5, 3],
					[640, 668, 8, 4],
					[900, 690, 6, 3],
					[1180, 676, 7, 4],
					[1380, 690, 5, 3],
					[1660, 682, 8, 4],
					[1880, 668, 6, 3],
					[2230, 686, 7, 4]
				]}
			/>
			<rect x={0} y={560} width={2400} height={140} fill="url(#saf-hero-shade)" />
		</svg>
	);
}
