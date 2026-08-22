import { Box } from '@chakra-ui/react';

// Renderiza las dos paletas (clara/oscura) y alterna cuál se muestra por CSS
// puro vía `_dark`, en vez de un color calculado en JS: useColorModeValue()
// no confía en re-renderizar a tiempo en el export estático (ver
// components/ui/color-mode.tsx), así que cualquier color que dependa del modo
// tiene que resolverse así, con display condicionado por la clase `.dark` del
// <html>, no con un hook.
export default function Logo({ size = 32 }: { size?: number }) {
	return (
		<Box as="span" display="inline-flex" flexShrink={0} w={`${size}px`} h={`${size}px`}>
			<Box as="span" display="block" _dark={{ display: 'none' }}>
				<svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="SAF Hub">
					<circle cx="50" cy="36" r="22" fill="#2F855A" />
					<circle cx="33" cy="45" r="17" fill="#38A169" />
					<circle cx="67" cy="45" r="17" fill="#38A169" />
					<rect x="46" y="56" width="8" height="28" rx="2.5" fill="#6B4226" />
				</svg>
			</Box>
			<Box as="span" display="none" _dark={{ display: 'block' }}>
				<svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="SAF Hub">
					<circle cx="50" cy="36" r="22" fill="#48BB78" />
					<circle cx="33" cy="45" r="17" fill="#68D391" />
					<circle cx="67" cy="45" r="17" fill="#68D391" />
					<rect x="46" y="56" width="8" height="28" rx="2.5" fill="#9C6B43" />
				</svg>
			</Box>
		</Box>
	);
}
