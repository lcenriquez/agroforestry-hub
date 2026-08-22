import { Box } from '@chakra-ui/react';
import { TreeIcon } from '@phosphor-icons/react';

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
				<TreeIcon size={size} weight="fill" color="#2F855A" aria-label="SAF Hub" />
			</Box>
			<Box as="span" display="none" _dark={{ display: 'block' }}>
				<TreeIcon size={size} weight="fill" color="#68D391" aria-label="SAF Hub" />
			</Box>
		</Box>
	);
}
