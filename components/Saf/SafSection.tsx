import { Box, Flex, Heading, Link, Stack } from '@chakra-ui/react';
import { LinkSimpleIcon } from '@phosphor-icons/react';

import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

interface SafSectionProps {
	id: string;
	title: string;
	icon: Icon;
	children: ReactNode;
}

// Sección con encabezado anclable (#id). scrollMarginTop deja aire arriba al
// saltar desde el índice.
export default function SafSection({ id, title, icon: SectionIcon, children }: SafSectionProps) {
	return (
		<Box as="section" id={id} scrollMarginTop="6" aria-labelledby={`${id}-titulo`}>
			<Flex align="center" gap={3} mb={4} className="group">
				<Flex
					align="center"
					justify="center"
					flexShrink={0}
					w={10}
					h={10}
					rounded="lg"
					bg="green.100"
					color="green.700"
					_dark={{ bg: 'green.900', color: 'green.200' }}
				>
					<SectionIcon size={22} weight="duotone" />
				</Flex>
				<Heading as="h2" id={`${id}-titulo`} size={{ base: 'xl', md: '2xl' }} lineHeight="short">
					{title}
				</Heading>
				<Link
					href={`#${id}`}
					aria-label={`Enlace a la sección ${title}`}
					color="fg.muted"
					opacity={{ base: 1, md: 0 }}
					_groupHover={{ opacity: 1 }}
					_focusVisible={{ opacity: 1 }}
					transition="opacity 0.2s"
				>
					<LinkSimpleIcon size={18} />
				</Link>
			</Flex>
			<Stack gap={4}>{children}</Stack>
		</Box>
	);
}
