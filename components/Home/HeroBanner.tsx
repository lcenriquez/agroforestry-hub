import NextLink from 'next/link';

import { Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { ArrowDownIcon, PencilRulerIcon, TreeIcon } from '@phosphor-icons/react';

import AgroforestryIllustration from './AgroforestryIllustration';
import { DARK_PALETTE, LIGHT_PALETTE, toCssVars } from './heroPalette';

import type { MouseEvent } from 'react';

const SKY_LIGHT = 'linear-gradient(180deg, #b9dcf0 0%, #dcefea 55%, #f4f1d8 100%)';
const SKY_DARK = 'linear-gradient(180deg, #070f1f 0%, #0f1f36 55%, #18304a 100%)';

// Velo detrás del texto (solo en pantallas anchas, donde el texto va encima de
// la ilustración): mantiene el contraste sin tapar el bosque de la derecha.
const SCRIM_LIGHT =
	'radial-gradient(ellipse 55% 75% at 20% 48%, rgba(240, 248, 244, 0.85) 0%, rgba(240, 248, 244, 0.55) 45%, rgba(240, 248, 244, 0) 75%)';
const SCRIM_DARK = 'radial-gradient(ellipse 55% 75% at 20% 48%, rgba(7, 15, 31, 0.8) 0%, rgba(7, 15, 31, 0.5) 45%, rgba(7, 15, 31, 0) 75%)';

// Hasta `lg` el texto va arriba y el paisaje en una franja abajo; desde `xl`
// el paisaje ocupa todo el banner y el texto queda encima, a la izquierda.
const STRIP = { base: '220px', sm: '250px', md: '300px', lg: '340px' };
const stripPadding = (height: string) => `calc(${height} + 1.5rem)`;

function scrollToCatalog(event: MouseEvent<HTMLAnchorElement>) {
	const target = document.getElementById('catalogo');
	if (!target) return;
	event.preventDefault();
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
	window.history.replaceState(null, '', '#catalogo');
}

export default function HeroBanner() {
	return (
		<Box
			as="section"
			aria-labelledby="hero-title"
			position="relative"
			overflow="hidden"
			flexShrink={0}
			width="100%"
			background={SKY_LIGHT}
			_dark={{ background: SKY_DARK }}
			css={{
				...toCssVars(LIGHT_PALETTE),
				'& .saf-night': { display: 'none' },
				_dark: {
					...toCssVars(DARK_PALETTE),
					'& .saf-day': { display: 'none' },
					'& .saf-night': { display: 'inline' }
				}
			}}
		>
			<Box position="absolute" left={0} right={0} bottom={0} height={{ ...STRIP, xl: '100%' }} pointerEvents="none">
				<AgroforestryIllustration />
			</Box>
			<Box
				position="absolute"
				inset={0}
				pointerEvents="none"
				display={{ base: 'none', xl: 'block' }}
				background={SCRIM_LIGHT}
				_dark={{ background: SCRIM_DARK }}
			/>

			<Container
				maxW="container.xl"
				position="relative"
				display="flex"
				alignItems="center"
				minH={{ xl: '620px' }}
				pt={{ base: 8, md: 12, xl: 10 }}
				pb={{ base: stripPadding(STRIP.base), sm: stripPadding(STRIP.sm), md: stripPadding(STRIP.md), lg: stripPadding(STRIP.lg), xl: 16 }}
			>
				<Stack gap={{ base: 4, md: 5 }} maxW={{ base: '100%', md: '2xl', xl: '640px' }}>
					<HStack
						alignSelf="flex-start"
						gap={2}
						px={3}
						py={1}
						rounded="full"
						fontSize="sm"
						fontWeight="semibold"
						color="green.800"
						bg="whiteAlpha.700"
						borderWidth="1px"
						borderColor="green.200"
						backdropFilter="blur(6px)"
						_dark={{ color: 'green.200', bg: 'blackAlpha.400', borderColor: 'green.800' }}
					>
						<TreeIcon size={16} weight="fill" aria-hidden="true" />
						<Text as="span">Sistemas agroforestales</Text>
					</HStack>

					<Heading
						as="h1"
						id="hero-title"
						fontSize={{ base: '2rem', sm: '2.25rem', md: '3rem', xl: '3.75rem' }}
						lineHeight={1.08}
						letterSpacing="-0.02em"
						fontWeight="extrabold"
						color="gray.900"
						_dark={{ color: 'white' }}
						textWrap="balance"
					>
						Diseña, cultiva y comparte{' '}
						<Box as="span" color="green.700" _dark={{ color: 'green.300' }}>
							sistemas agroforestales
						</Box>
					</Heading>

					<Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700" _dark={{ color: 'gray.200' }} maxW="xl" textWrap="pretty">
						Combina árboles, frutales y cultivos en capas, como en un bosque. Explora especies por estrato y función ecológica, planea tu parcela y
						aprende de las experiencias de la comunidad.
					</Text>

					<Stack direction={{ base: 'column', sm: 'row' }} gap={3} pt={2} flexWrap="wrap">
						<Button asChild size={{ base: 'md', md: 'lg' }} colorPalette="green" rounded="full" px={6}>
							<a href="#catalogo" onClick={scrollToCatalog}>
								Explorar especies
								<ArrowDownIcon weight="bold" aria-hidden="true" />
							</a>
						</Button>
						<Button
							asChild
							size={{ base: 'md', md: 'lg' }}
							variant="outline"
							colorPalette="green"
							rounded="full"
							px={6}
							bg="whiteAlpha.800"
							backdropFilter="blur(6px)"
							_hover={{ bg: 'white' }}
							_dark={{ bg: 'blackAlpha.500', _hover: { bg: 'blackAlpha.700' } }}
						>
							<NextLink href="/disenador">
								<PencilRulerIcon weight="bold" aria-hidden="true" />
								Diseña tu SAF
							</NextLink>
						</Button>
						<Button
							asChild
							size={{ base: 'md', md: 'lg' }}
							variant="ghost"
							colorPalette="green"
							rounded="full"
							px={5}
							color="green.800"
							bg="whiteAlpha.500"
							backdropFilter="blur(6px)"
							_hover={{ bg: 'whiteAlpha.800' }}
							_dark={{ color: 'green.200', bg: 'blackAlpha.300', _hover: { bg: 'blackAlpha.600' } }}
						>
							<NextLink href="/saf">¿Qué es un SAF?</NextLink>
						</Button>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
