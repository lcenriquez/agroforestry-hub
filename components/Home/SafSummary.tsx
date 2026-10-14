import NextLink from 'next/link';

import { Box, Button, Card, Flex, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import {
	ArrowRightIcon,
	BasketIcon,
	ButterflyIcon,
	DropIcon,
	LeafIcon,
	PlantIcon,
	ShovelIcon,
	SparkleIcon,
	StackIcon,
	TreeIcon
} from '@phosphor-icons/react';

import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

function IconBadge({ icon: IconComponent }: { icon: Icon }) {
	return (
		<Flex
			w={11}
			h={11}
			rounded="xl"
			align="center"
			justify="center"
			flexShrink={0}
			bg="green.100"
			color="green.700"
			_dark={{ bg: 'green.900', color: 'green.200' }}
		>
			<IconComponent size={24} weight="duotone" aria-hidden="true" />
		</Flex>
	);
}

function SummaryCard({ icon, title, children }: { icon: Icon; title: string; children: ReactNode }) {
	return (
		<Card.Root
			variant="outline"
			size="sm"
			height="100%"
			transition="border-color 0.2s ease, box-shadow 0.2s ease"
			_hover={{ borderColor: 'green.300', boxShadow: 'sm' }}
			_dark={{ _hover: { borderColor: 'green.700' } }}
		>
			<Card.Body gap={3}>
				<IconBadge icon={icon} />
				<Heading as="h3" size="md">
					{title}
				</Heading>
				{children}
			</Card.Body>
		</Card.Root>
	);
}

const BENEFITS: { icon: Icon; label: string }[] = [
	{ icon: ShovelIcon, label: 'Suelo más fértil y protegido' },
	{ icon: DropIcon, label: 'Mejor retención de agua' },
	{ icon: ButterflyIcon, label: 'Hábitat para la biodiversidad' },
	{ icon: LeafIcon, label: 'Captura de carbono y microclima más fresco' },
	{ icon: BasketIcon, label: 'Alimentos e ingresos diversos' }
];

export default function SafSummary() {
	return (
		<Stack as="section" aria-labelledby="saf-summary-title" gap={6}>
			<Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'flex-end' }} gap={4}>
				<Stack gap={2} maxW="2xl">
					<Text fontSize="sm" fontWeight="semibold" letterSpacing="wide" textTransform="uppercase" color="green.700" _dark={{ color: 'green.300' }}>
						Lo esencial
					</Text>
					<Heading as="h2" id="saf-summary-title" size="2xl">
						Los SAF en pocas palabras
					</Heading>
					<Text color="fg.muted">Un sistema agroforestal produce alimento mientras regenera el terreno, aprovechando cómo funciona un bosque.</Text>
				</Stack>
				<Button asChild variant="outline" colorPalette="green" rounded="full" flexShrink={0}>
					<NextLink href="/saf">
						Aprende más sobre los SAF
						<ArrowRightIcon weight="bold" aria-hidden="true" />
					</NextLink>
				</Button>
			</Flex>

			<SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
				<SummaryCard icon={TreeIcon} title="¿Qué es un SAF?">
					<Text fontSize="sm" color="fg.muted">
						Es una forma de manejar la tierra que combina árboles y arbustos con cultivos y/o animales en el mismo terreno, imitando la estructura y
						las funciones de un bosque natural.
					</Text>
				</SummaryCard>

				<SummaryCard icon={StackIcon} title="Estratos">
					<Text fontSize="sm" color="fg.muted">
						Las especies se acomodan por altura y necesidad de luz —emergente, alto, medio y bajo, más la cobertura del suelo— para aprovechar mejor
						el espacio y la luz del sol.
					</Text>
				</SummaryCard>

				<SummaryCard icon={PlantIcon} title="Sucesión">
					<Text fontSize="sm" color="fg.muted">
						Se combinan especies de ciclo corto, mediano y largo: mientras los árboles crecen, los cultivos anuales y los frutales ya dan cosecha, y
						el sistema madura con el tiempo.
					</Text>
				</SummaryCard>

				<SummaryCard icon={SparkleIcon} title="Beneficios">
					<Stack as="ul" gap={1.5} listStyleType="none" fontSize="sm" color="fg.muted">
						{BENEFITS.map(({ icon: BenefitIcon, label }) => (
							<HStack as="li" key={label} gap={2} align="flex-start">
								<Box as="span" color="green.600" _dark={{ color: 'green.300' }} pt="2px" flexShrink={0}>
									<BenefitIcon size={16} weight="bold" aria-hidden="true" />
								</Box>
								<Text as="span">{label}</Text>
							</HStack>
						))}
					</Stack>
				</SummaryCard>
			</SimpleGrid>
		</Stack>
	);
}
