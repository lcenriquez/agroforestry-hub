import { Accordion, Badge, Box, Card, Flex, Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import {
	ArrowRightIcon,
	ArrowSquareOutIcon,
	BooksIcon,
	CompassIcon,
	MapPinIcon,
	QuestionIcon,
	SealCheckIcon,
	SquaresFourIcon,
	StackIcon,
	TextAaIcon,
	TreeIcon,
	TreeStructureIcon,
	WarningIcon
} from '@phosphor-icons/react';

import { CitedText } from './Cite';
import {
	BENEFITS,
	CHALLENGES,
	CHALLENGES_INTRO,
	CLASSIFICATION,
	CLASSIFICATION_INTRO,
	DEFINITION,
	DEFINITION_HIGHLIGHT,
	FAQS,
	GLOSSARY,
	PRACTICES,
	PRACTICES_INTRO,
	SOURCES,
	STEPS,
	STRATA_INTRO,
	SUCCESSION,
	SUCCESSION_INTRO,
	SYSTEM_PHASES
} from './content';
import CtaButton from './CtaButton';
import SafSection from './SafSection';
import StrataDiagram from './StrataDiagram';

import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

// --- Piezas comunes --------------------------------------------------------

function IconBadge({ icon: ItemIcon, size = 20 }: { icon: Icon; size?: number }) {
	return (
		<Flex
			align="center"
			justify="center"
			flexShrink={0}
			w={9}
			h={9}
			rounded="full"
			bg="green.50"
			color="green.700"
			_dark={{ bg: 'whiteAlpha.100', color: 'green.300' }}
		>
			<ItemIcon size={size} weight="duotone" />
		</Flex>
	);
}

function Callout({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'orange' }) {
	return (
		<Box
			borderStartWidth="4px"
			borderColor={tone === 'green' ? 'green.500' : 'orange.400'}
			bg={tone === 'green' ? 'green.50' : 'orange.50'}
			_dark={{ bg: 'whiteAlpha.50', borderColor: tone === 'green' ? 'green.300' : 'orange.300' }}
			rounded="md"
			px={4}
			py={3}
		>
			{children}
		</Box>
	);
}

function SubHeading({ children }: { children: ReactNode }) {
	return (
		<Heading as="h3" size="lg" mt={4}>
			{children}
		</Heading>
	);
}

// --- 1. ¿Qué es? -----------------------------------------------------------

export function DefinitionSection() {
	return (
		<SafSection id="que-es" title="¿Qué es un sistema agroforestal?" icon={TreeIcon}>
			{DEFINITION.map(paragraph => (
				<CitedText key={paragraph.text} paragraph={paragraph} />
			))}
			<Callout>
				<CitedText paragraph={DEFINITION_HIGHLIGHT} fontWeight="semibold" fontSize={{ base: 'md', md: 'lg' }} />
			</Callout>
		</SafSection>
	);
}

// --- 2. Clasificación ------------------------------------------------------

export function ClassificationSection() {
	return (
		<SafSection id="clasificacion" title="Clasificación de los SAF" icon={SquaresFourIcon}>
			<CitedText paragraph={CLASSIFICATION_INTRO} />
			<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
				{CLASSIFICATION.map(item => (
					<Card.Root key={item.title} variant="outline" size="sm">
						<Card.Body gap={3}>
							<Flex align="center" gap={3}>
								<IconBadge icon={item.icon} />
								<Box minW={0}>
									<Card.Title>{item.title}</Card.Title>
									<Text fontSize="sm" color="green.700" _dark={{ color: 'green.300' }} fontWeight="medium">
										{item.formula}
									</Text>
								</Box>
							</Flex>
							<Text fontSize="sm">{item.description}</Text>
							<Text fontSize="sm" color="fg.muted">
								<Text as="span" fontWeight="semibold">
									Ejemplos:
								</Text>{' '}
								{item.examples}
							</Text>
						</Card.Body>
					</Card.Root>
				))}
			</SimpleGrid>
		</SafSection>
	);
}

// --- 3. Prácticas ----------------------------------------------------------

export function PracticesSection() {
	return (
		<SafSection id="practicas" title="Prácticas comunes y ejemplos en México" icon={TreeStructureIcon}>
			<CitedText paragraph={PRACTICES_INTRO} />
			<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
				{PRACTICES.map(practice => (
					<Card.Root key={practice.title} variant="outline" size="sm">
						<Card.Body gap={3}>
							<Flex align="flex-start" gap={3}>
								<IconBadge icon={practice.icon} />
								<Stack gap={1} minW={0}>
									<Card.Title lineHeight="short">{practice.title}</Card.Title>
									<Badge alignSelf="start" colorPalette="green" variant="subtle" size="sm">
										{practice.tag}
									</Badge>
								</Stack>
							</Flex>
							{practice.description.map(paragraph => (
								<CitedText key={paragraph.text} paragraph={paragraph} fontSize="sm" />
							))}
							{practice.mexico && (
								<Box mt="auto" rounded="md" bg="bg.subtle" px={3} py={2}>
									<Flex align="center" gap={1.5} fontSize="xs" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={1}>
										<MapPinIcon size={14} weight="fill" />
										En México
									</Flex>
									<CitedText paragraph={practice.mexico} fontSize="sm" />
								</Box>
							)}
						</Card.Body>
					</Card.Root>
				))}
			</SimpleGrid>
		</SafSection>
	);
}

// --- 4. Estratos y sucesión ------------------------------------------------

export function StrataSection() {
	return (
		<SafSection id="estratos" title="Estratos y sucesión" icon={StackIcon}>
			{STRATA_INTRO.map(paragraph => (
				<CitedText key={paragraph.text} paragraph={paragraph} />
			))}
			<StrataDiagram />

			<SubHeading>Diseñar en el tiempo: la sucesión</SubHeading>
			<CitedText paragraph={SUCCESSION_INTRO} />
			<Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 3 }} align="stretch">
				{SUCCESSION.map((stage, index) => (
					<Flex key={stage.name} direction={{ base: 'column', md: 'row' }} align="center" gap={{ base: 2, md: 3 }} flex={1} minW={0}>
						<Card.Root variant="subtle" size="sm" w="full" h="full">
							<Card.Body gap={2}>
								<Flex justify="space-between" align="baseline" gap={2} wrap="wrap">
									<Card.Title>{stage.name}</Card.Title>
									<Badge colorPalette="green" variant="outline" size="sm">
										{stage.cycle}
									</Badge>
								</Flex>
								<Text fontSize="sm">{stage.description}</Text>
								<Text fontSize="sm" color="fg.muted">
									{stage.examples}
								</Text>
							</Card.Body>
						</Card.Root>
						{index < SUCCESSION.length - 1 && (
							<Box color="green.600" _dark={{ color: 'green.300' }} flexShrink={0} transform={{ base: 'rotate(90deg)', md: 'none' }} aria-hidden>
								<ArrowRightIcon size={20} weight="bold" />
							</Box>
						)}
					</Flex>
				))}
			</Flex>
			<Callout>
				<CitedText paragraph={SYSTEM_PHASES} fontSize="sm" />
			</Callout>
			<Text>En el catálogo de SAF Hub cada especie indica su estrato, y en el diseñador puedes acomodarlas por capas para planear tu parcela.</Text>
			<Flex gap={3} wrap="wrap">
				<CtaButton href="/disenador">Diseña tu SAF</CtaButton>
				<CtaButton href="/#catalogo" variant="outline">
					Ver especies por estrato
				</CtaButton>
			</Flex>
		</SafSection>
	);
}

// --- 5. Beneficios ---------------------------------------------------------

export function BenefitsSection() {
	return (
		<SafSection id="beneficios" title="Beneficios" icon={SealCheckIcon}>
			<SimpleGrid columns={{ base: 1, lg: 3 }} gap={4}>
				{BENEFITS.map(group => (
					<Card.Root key={group.title} variant="outline" size="sm">
						<Card.Header>
							<Flex align="center" gap={3}>
								<IconBadge icon={group.icon} />
								<Card.Title>{group.title}</Card.Title>
							</Flex>
						</Card.Header>
						<Card.Body>
							<Stack as="ul" gap={3} m={0} ps={4} listStyleType="disc">
								{group.items.map(item => (
									<CitedText as="li" key={item.text} paragraph={item} fontSize="sm" />
								))}
							</Stack>
						</Card.Body>
					</Card.Root>
				))}
			</SimpleGrid>
		</SafSection>
	);
}

// --- 6. Retos --------------------------------------------------------------

export function ChallengesSection() {
	return (
		<SafSection id="retos" title="Retos y consideraciones" icon={WarningIcon}>
			<CitedText paragraph={CHALLENGES_INTRO} />
			<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
				{CHALLENGES.map(challenge => (
					<Flex key={challenge.title} gap={3} align="flex-start" borderWidth="1px" borderColor="border" rounded="lg" p={4}>
						<Flex
							align="center"
							justify="center"
							flexShrink={0}
							w={9}
							h={9}
							rounded="full"
							bg="orange.50"
							color="orange.700"
							_dark={{ bg: 'whiteAlpha.100', color: 'orange.300' }}
						>
							<challenge.icon size={20} weight="duotone" />
						</Flex>
						<Box minW={0}>
							<Text fontWeight="bold" mb={1}>
								{challenge.title}
							</Text>
							<CitedText paragraph={challenge.text} fontSize="sm" color="fg.muted" />
						</Box>
					</Flex>
				))}
			</SimpleGrid>
		</SafSection>
	);
}

// --- 7. Cómo empezar -------------------------------------------------------

export function StepsSection() {
	return (
		<SafSection id="como-empezar" title="Cómo empezar a diseñar tu SAF" icon={CompassIcon}>
			<Text>
				No hay una receta única: cada SAF responde a su terreno y a quien lo trabaja. Estos pasos te ayudan a ordenar el proceso; empieza pequeño,
				observa y ajusta.
			</Text>
			<Stack as="ol" gap={0} listStyleType="none" m={0} p={0}>
				{STEPS.map((step, index) => {
					const isLast = index === STEPS.length - 1;
					return (
						<Flex as="li" key={step.title} gap={{ base: 3, md: 4 }}>
							<Flex direction="column" align="center" flexShrink={0}>
								<Flex
									align="center"
									justify="center"
									w={9}
									h={9}
									rounded="full"
									bg="green.600"
									color="white"
									fontWeight="bold"
									_dark={{ bg: 'green.400', color: 'gray.900' }}
								>
									{index + 1}
								</Flex>
								{!isLast && <Box w="2px" flex={1} bg="green.200" _dark={{ bg: 'green.800' }} my={1} />}
							</Flex>
							<Stack gap={2} pb={isLast ? 0 : 6} minW={0} flex={1}>
								<Flex align="center" gap={2} minH={9}>
									<Box color="green.700" _dark={{ color: 'green.300' }} flexShrink={0}>
										<step.icon size={20} weight="duotone" />
									</Box>
									<Heading as="h3" size="md">
										{step.title}
									</Heading>
								</Flex>
								<Text>{step.text}</Text>
								<Stack as="ul" gap={1} m={0} ps={5} listStyleType="disc" color="fg.muted" fontSize="sm">
									{step.tips.map(tip => (
										<li key={tip}>{tip}</li>
									))}
								</Stack>
								{step.cta && (
									<Box pt={1}>
										<CtaButton href={step.cta.href} variant={step.cta.href === '/disenador' ? 'solid' : 'outline'}>
											{step.cta.label}
										</CtaButton>
									</Box>
								)}
							</Stack>
						</Flex>
					);
				})}
			</Stack>
		</SafSection>
	);
}

// --- 8. Glosario -----------------------------------------------------------

export function GlossarySection() {
	return (
		<SafSection id="glosario" title="Glosario" icon={TextAaIcon}>
			<SimpleGrid as="dl" columns={{ base: 1, md: 2 }} gapX={6} gapY={4}>
				{GLOSSARY.map(item => (
					<Box key={item.term} borderBottomWidth="1px" borderColor="border" pb={3}>
						<Text as="dt" fontWeight="bold" color="green.800" _dark={{ color: 'green.200' }}>
							{item.term}
						</Text>
						<Text as="dd" m={0} fontSize="sm" color="fg.muted">
							{item.definition}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</SafSection>
	);
}

// --- 9. Preguntas frecuentes -----------------------------------------------

export function FaqSection() {
	return (
		<SafSection id="preguntas" title="Preguntas frecuentes" icon={QuestionIcon}>
			<Accordion.Root collapsible multiple variant="enclosed">
				{FAQS.map((faq, index) => (
					<Accordion.Item key={faq.question} value={`faq-${index}`}>
						<Accordion.ItemTrigger cursor="pointer">
							<Text flex={1} textAlign="start" fontWeight="semibold">
								{faq.question}
							</Text>
							<Accordion.ItemIndicator />
						</Accordion.ItemTrigger>
						<Accordion.ItemContent>
							<Accordion.ItemBody>
								<CitedText paragraph={faq.answer} />
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				))}
			</Accordion.Root>
		</SafSection>
	);
}

// --- 10. Fuentes -----------------------------------------------------------

export function SourcesSection() {
	return (
		<SafSection id="fuentes" title="Fuentes y referencias" icon={BooksIcon}>
			<Text fontSize="sm" color="fg.muted">
				Los números entre corchetes en el texto remiten a esta lista. Las cifras corresponden a los estudios citados y pueden variar según la región y
				el año.
			</Text>
			<Stack as="ol" gap={2} m={0} ps={0} listStyleType="none" fontSize="sm">
				{SOURCES.map((source, index) => (
					<Flex
						as="li"
						key={source.id}
						id={`fuente-${source.id}`}
						gap={3}
						scrollMarginTop="6"
						rounded="md"
						px={2}
						py={1}
						_target={{ bg: 'yellow.100', _dark: { bg: 'whiteAlpha.200' } }}
					>
						<Text as="span" fontWeight="bold" color="fg.muted" minW="2ch" textAlign="end" flexShrink={0}>
							{index + 1}.
						</Text>
						<Box minW={0} overflowWrap="anywhere">
							<Link href={source.url} target="_blank" rel="noreferrer" color="green.700" _dark={{ color: 'green.300' }} fontWeight="medium">
								{source.title}
								<ArrowSquareOutIcon size={14} aria-label="(abre en una pestaña nueva)" />
							</Link>
							<Text color="fg.muted">{source.publisher}</Text>
						</Box>
					</Flex>
				))}
			</Stack>
			<Callout tone="orange">
				<Text fontSize="sm">
					Esta guía es introductoria y no sustituye la asesoría técnica local. Si tienes correcciones o fuentes adicionales, compártelas con el equipo
					de SAF Hub.
				</Text>
			</Callout>
		</SafSection>
	);
}
