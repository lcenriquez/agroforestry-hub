import { Badge, Box, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { TreeIcon } from '@phosphor-icons/react';

import { Cite } from './Cite';
import { HERO, KEY_STATS } from './content';
import CtaButton from './CtaButton';

export default function SafHero() {
	return (
		<Box
			position="relative"
			overflow="hidden"
			rounded={{ base: 'xl', md: '2xl' }}
			borderWidth="1px"
			borderColor="green.100"
			bgGradient="to-br"
			gradientFrom="green.50"
			gradientTo="white"
			_dark={{ borderColor: 'green.900', gradientFrom: 'green.950', gradientTo: 'gray.900' }}
			px={{ base: 4, md: 10 }}
			py={{ base: 8, md: 12 }}
		>
			<Box
				position="absolute"
				insetEnd={{ base: -10, md: 0 }}
				bottom={{ base: -6, md: -4 }}
				color="green.200"
				opacity={0.6}
				_dark={{ color: 'green.900' }}
				pointerEvents="none"
				aria-hidden
				display={{ base: 'none', md: 'block' }}
			>
				<TreeIcon size={220} weight="fill" />
			</Box>

			<Stack gap={5} position="relative" maxW="3xl">
				<Badge alignSelf="start" colorPalette="green" variant="solid" size="md">
					{HERO.eyebrow}
				</Badge>
				<Heading as="h1" size={{ base: '2xl', md: '5xl' }} lineHeight="1.1">
					{HERO.title}
				</Heading>
				<Text fontSize={{ base: 'md', md: 'lg' }} color="fg.muted">
					{HERO.lead}
				</Text>
				<Flex gap={3} wrap="wrap">
					<CtaButton href="/disenador">Diseña tu SAF</CtaButton>
					<CtaButton href="/#catalogo" variant="outline">
						Explorar especies
					</CtaButton>
				</Flex>
			</Stack>

			<SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mt={{ base: 8, md: 10 }} position="relative">
				{KEY_STATS.map(stat => (
					<Box
						key={stat.value}
						bg="whiteAlpha.800"
						borderWidth="1px"
						borderColor="green.100"
						_dark={{ bg: 'blackAlpha.400', borderColor: 'green.900' }}
						rounded="lg"
						px={4}
						py={3}
						backdropFilter="blur(4px)"
					>
						<Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="green.700" _dark={{ color: 'green.300' }} lineHeight="1.2">
							{stat.value}
						</Text>
						<Text fontSize="sm" color="fg.muted">
							{stat.label}
							<Cite ids={stat.cites} />
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</Box>
	);
}
