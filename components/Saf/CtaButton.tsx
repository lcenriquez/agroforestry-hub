import NextLink from 'next/link';

import { Button } from '@chakra-ui/react';
import { ArrowRightIcon } from '@phosphor-icons/react';

import type { ReactNode } from 'react';

// Botón-enlace interno (next/link) con el estilo de llamada a la acción de /saf.
export default function CtaButton({ href, children, variant = 'solid' }: { href: string; children: ReactNode; variant?: 'solid' | 'outline' }) {
	return (
		<Button
			asChild
			colorPalette="green"
			variant={variant}
			size={{ base: 'md', md: 'lg' }}
			whiteSpace="normal"
			h="auto"
			minH={{ base: 10, md: 11 }}
			py={2}
		>
			<NextLink href={href}>
				{children}
				<ArrowRightIcon />
			</NextLink>
		</Button>
	);
}
