import { useEffect, useState } from 'react';

import { Box, Collapsible, Flex, Link, Stack, Text } from '@chakra-ui/react';
import { CaretDownIcon, ListBulletsIcon } from '@phosphor-icons/react';

import { TOC } from './content';

// Marca en el índice la sección que se está leyendo. Solo corre en el
// cliente (useEffect), así que no rompe el export estático.
function useActiveSection() {
	const [active, setActive] = useState<string>(TOC[0].id);

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') return;
		const elements = TOC.map(item => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
		const observer = new IntersectionObserver(
			entries => {
				const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) setActive(visible[0].target.id);
			},
			{ rootMargin: '0px 0px -70% 0px', threshold: 0 }
		);
		elements.forEach(el => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return active;
}

function TocLinks({ active, onNavigate }: { active?: string; onNavigate?: () => void }) {
	return (
		<Stack as="ol" gap={0.5} listStyleType="none" m={0} p={0}>
			{TOC.map((item, index) => {
				const isActive = item.id === active;
				return (
					<li key={item.id}>
						<Link
							href={`#${item.id}`}
							onClick={onNavigate}
							display="flex"
							gap={2}
							px={3}
							py={1.5}
							rounded="md"
							fontSize="sm"
							borderStartWidth="2px"
							borderColor={isActive ? 'green.600' : 'transparent'}
							bg={isActive ? 'green.50' : 'transparent'}
							color={isActive ? 'green.800' : 'fg.muted'}
							fontWeight={isActive ? 600 : 400}
							textDecoration="none"
							_hover={{ bg: 'green.50', color: 'green.800', textDecoration: 'none' }}
							_dark={{
								borderColor: isActive ? 'green.300' : 'transparent',
								bg: isActive ? 'whiteAlpha.100' : 'transparent',
								color: isActive ? 'green.200' : 'fg.muted',
								_hover: { bg: 'whiteAlpha.100', color: 'green.200' }
							}}
							aria-current={isActive ? 'location' : undefined}
						>
							<Text as="span" color="fg.subtle" minW="1.25em">
								{index + 1}.
							</Text>
							{item.label}
						</Link>
					</li>
				);
			})}
		</Stack>
	);
}

// Índice fijo en la barra lateral (escritorio).
export function SafTocSidebar() {
	const active = useActiveSection();

	return (
		<Box as="nav" aria-label="Contenido de la página" position="sticky" top={6} maxH="calc(100vh - 3rem)" overflowY="auto" pb={4}>
			<Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="fg.muted" mb={2} px={3}>
				En esta página
			</Text>
			<TocLinks active={active} />
		</Box>
	);
}

// Índice plegable (móvil y tabletas).
export function SafTocInline() {
	const [open, setOpen] = useState(false);

	return (
		<Collapsible.Root open={open} onOpenChange={details => setOpen(details.open)}>
			<Box as="nav" aria-label="Contenido de la página" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle">
				<Collapsible.Trigger asChild>
					<Flex as="button" w="full" align="center" justify="space-between" gap={2} px={4} py={3} cursor="pointer" fontWeight="semibold">
						<Flex align="center" gap={2}>
							<ListBulletsIcon size={18} />
							En esta página
						</Flex>
						<Box as="span" transition="transform 0.2s" transform={open ? 'rotate(180deg)' : undefined}>
							<CaretDownIcon size={16} />
						</Box>
					</Flex>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Box px={1} pb={3}>
						<TocLinks onNavigate={() => setOpen(false)} />
					</Box>
				</Collapsible.Content>
			</Box>
		</Collapsible.Root>
	);
}
