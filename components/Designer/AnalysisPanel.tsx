import NextLink from 'next/link';
import { memo } from 'react';

import { Badge, Box, Button, Heading, HStack, Link, SimpleGrid, Stack, Text, Wrap } from '@chakra-ui/react';
import { CheckCircleIcon, LightbulbIcon, WarningIcon } from '@phosphor-icons/react';

import { getAdditionalFunctionIcon, getEcologicalFunctionIcon } from '../Helpers/VisualRepresentations';
import { StratumDot } from './SpeciesPalette';
import { formatNumber } from './strata';

import type { DesignAnalysis, FunctionInfo, Suggestion } from './analysis';
import type { PlantSpec } from './strata';

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<Box borderWidth="1px" borderRadius="md" px={2} py={1.5}>
			<Text fontSize="xs" color="fg.muted">
				{label}
			</Text>
			<Text fontSize="lg" fontWeight="semibold" lineHeight="short">
				{value}
			</Text>
		</Box>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Stack gap={2}>
			<Heading size="sm">{title}</Heading>
			{children}
		</Stack>
	);
}

function CoverageBar({ percent, target, color }: { percent: number; target: number | null; color: string }) {
	return (
		<Box position="relative" h="10px" bg="bg.muted" borderRadius="full" overflow="visible">
			<Box h="100%" w={`${Math.min(100, percent)}%`} bg={color} borderRadius="full" transition="width 0.2s" />
			{target !== null && (
				<Box
					position="absolute"
					top="-3px"
					bottom="-3px"
					left={`${target}%`}
					w="2px"
					bg="fg"
					borderRadius="full"
					title={`Guía: ${target}%`}
					aria-hidden
				/>
			)}
		</Box>
	);
}

function FunctionBadge({ fn, covered }: { fn: FunctionInfo; covered: boolean }) {
	const icon = fn.group === 'ecological' ? getEcologicalFunctionIcon(fn.sourceId) : getAdditionalFunctionIcon(fn.sourceId);
	return (
		<Badge size="sm" variant={covered ? 'solid' : 'outline'} colorPalette={covered ? 'green' : fn.key ? 'orange' : 'gray'} gap={1}>
			{icon}
			{fn.name}
		</Badge>
	);
}

function IssueItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
	return (
		<HStack align="start" gap={2} fontSize="sm">
			<Box color="orange.fg" pt="3px" flexShrink={0}>
				<WarningIcon />
			</Box>
			<Box flex={1}>
				{children}
				{onClick && (
					<Button size="2xs" variant="plain" colorPalette="blue" px={1} h="auto" onClick={onClick}>
						Ver
					</Button>
				)}
			</Box>
		</HStack>
	);
}

interface AnalysisPanelProps {
	analysis: DesignAnalysis;
	suggestions: Suggestion[];
	nameOfPlant: (plantId: string) => string;
	onSelectPlant: (plantId: string) => void;
	onPickSpecies: (speciesId: string) => void;
	onRemoveMissing: () => void;
}

function AnalysisPanel({ analysis, suggestions, nameOfPlant, onSelectPlant, onPickSpecies, onRemoveMissing }: AnalysisPanelProps) {
	const { plantCount } = analysis;
	const hasIssues =
		analysis.missingStrata.length +
			analysis.overlaps.length +
			analysis.outside.length +
			analysis.missingSpeciesPlants.length +
			analysis.shade.length >
		0;

	return (
		<Stack gap={5}>
			<Section title="Resumen">
				<SimpleGrid columns={2} gap={2}>
					<Stat label="Plantas" value={String(plantCount)} />
					<Stat label="Especies" value={String(analysis.speciesCount)} />
					<Stat label="Área" value={`${formatNumber(analysis.plotArea, 0)} m²`} />
					<Stat label="Densidad" value={`${formatNumber(analysis.density, 0)} /ha`} />
				</SimpleGrid>
			</Section>

			<Section title="Cobertura de copa por estrato">
				{analysis.coverage.length === 0 ? (
					<Text fontSize="sm" color="fg.muted">
						El catálogo no tiene estratos registrados.
					</Text>
				) : (
					<Stack gap={3}>
						{analysis.coverage.map(({ stratum, percent, plantCount: count }) => (
							<Stack key={stratum._id} gap={1}>
								<HStack justify="space-between" fontSize="sm" gap={2}>
									<HStack gap={1.5} minW={0}>
										<StratumDot color={stratum.color} />
										<Text truncate>{stratum.name}</Text>
										<Text color="fg.muted" fontSize="xs" flexShrink={0}>
											({count})
										</Text>
									</HStack>
									<Text flexShrink={0} fontVariantNumeric="tabular-nums">
										{formatNumber(percent, 0)}%{stratum.target !== null && <Text as="span" color="fg.muted">{` / guía ${stratum.target}%`}</Text>}
									</Text>
								</HStack>
								<CoverageBar percent={percent} target={stratum.target} color={stratum.color} />
							</Stack>
						))}
						<Text fontSize="xs" color="fg.muted">
							Cobertura total: {formatNumber(analysis.totalCoverage, 0)}% del terreno. Las guías (emergente ~20%, alto ~40%, medio ~60%, bajo ~80%)
							son valores orientativos de la agricultura sintrópica para un sistema maduro, no reglas fijas. Se calcula con el promedio del rango de
							copa de cada especie, muestreando el terreno cada {formatNumber(analysis.sampleCell, 2)} m.{' '}
							<Link asChild color="green.fg">
								<NextLink href="/saf">¿Qué son los estratos?</NextLink>
							</Link>
						</Text>
					</Stack>
				)}
			</Section>

			<Section title="Alertas">
				{plantCount === 0 ? (
					<Text fontSize="sm" color="fg.muted">
						Aún no hay plantas en el diseño.
					</Text>
				) : !hasIssues ? (
					<HStack fontSize="sm" color="green.fg">
						<CheckCircleIcon />
						<Text>Sin alertas por ahora.</Text>
					</HStack>
				) : (
					<Stack gap={1.5}>
						{analysis.missingStrata.map(stratum => (
							<IssueItem key={stratum._id}>
								Falta el estrato <strong>{stratum.name.toLowerCase()}</strong>.
							</IssueItem>
						))}
						{analysis.overlaps.slice(0, 6).map(issue => (
							<IssueItem key={`${issue.a}-${issue.b}`} onClick={() => onSelectPlant(issue.a)}>
								{nameOfPlant(issue.a)} y {nameOfPlant(issue.b)} (mismo estrato: {issue.stratum.name.toLowerCase()}) se enciman{' '}
								{formatNumber(issue.fraction * 100, 0)}% de copa.
							</IssueItem>
						))}
						{analysis.overlaps.length > 6 && (
							<Text fontSize="xs" color="fg.muted" pl={6}>
								…y {analysis.overlaps.length - 6} encimamientos más (marcados en rojo en el plano).
							</Text>
						)}
						{analysis.outside.length > 0 && (
							<IssueItem onClick={() => onSelectPlant(analysis.outside[0])}>
								{analysis.outside.length === 1 ? '1 planta está' : `${analysis.outside.length} plantas están`} fuera del terreno.
							</IssueItem>
						)}
						{analysis.shade.slice(0, 3).map(issue => (
							<IssueItem key={issue.plantId} onClick={() => onSelectPlant(issue.plantId)}>
								{nameOfPlant(issue.plantId)} prefiere sol y queda bajo la copa de {nameOfPlant(issue.coveredBy)}.
							</IssueItem>
						))}
						{analysis.missingSpeciesPlants.length > 0 && (
							<IssueItem>
								{analysis.missingSpeciesPlants.length} planta(s) de especies que ya no están en el catálogo (en gris).{' '}
								<Button size="2xs" variant="plain" colorPalette="red" px={1} h="auto" onClick={onRemoveMissing}>
									Quitarlas
								</Button>
							</IssueItem>
						)}
					</Stack>
				)}
			</Section>

			<Section title="Funciones cubiertas">
				{analysis.coveredFunctions.length === 0 && analysis.missingFunctions.length === 0 ? (
					<Text fontSize="sm" color="fg.muted">
						Sin información de funciones en el catálogo.
					</Text>
				) : (
					<Stack gap={2}>
						<Wrap gap={1}>
							{analysis.coveredFunctions.map(fn => (
								<FunctionBadge key={fn.id} fn={fn} covered />
							))}
							{analysis.coveredFunctions.length === 0 && (
								<Text fontSize="sm" color="fg.muted">
									Ninguna todavía.
								</Text>
							)}
						</Wrap>
						{analysis.missingFunctions.length > 0 && (
							<>
								<Text fontSize="xs" color="fg.muted">
									Faltan (en naranja las clave para un SAF):
								</Text>
								<Wrap gap={1}>
									{analysis.missingFunctions.map(fn => (
										<FunctionBadge key={fn.id} fn={fn} covered={false} />
									))}
								</Wrap>
							</>
						)}
					</Stack>
				)}
			</Section>

			{suggestions.length > 0 && (
				<Section title="Sugerencias">
					<Stack gap={3}>
						{suggestions.map(suggestion => (
							<Stack key={suggestion.reason} gap={1}>
								<HStack fontSize="sm" gap={1.5}>
									<Box color="yellow.fg">
										<LightbulbIcon />
									</Box>
									<Text fontWeight="medium">{suggestion.reason}</Text>
								</HStack>
								<Wrap gap={1}>
									{suggestion.species.map((spec: PlantSpec) => (
										<Button
											key={spec.speciesId}
											size="2xs"
											variant="outline"
											onClick={() => onPickSpecies(spec.speciesId)}
											title={`${spec.scientificName} · alt ${spec.heightLabel} · copa ${spec.crownLabel}`}
										>
											<StratumDot color={spec.stratum.color} size="8px" />
											{spec.name}
										</Button>
									))}
								</Wrap>
							</Stack>
						))}
					</Stack>
				</Section>
			)}

			{analysis.speciesCounts.length > 0 && (
				<Section title="Especies en el diseño">
					<Stack gap={1}>
						{analysis.speciesCounts.map(({ spec, count }) => (
							<HStack key={spec.speciesId} justify="space-between" fontSize="sm" gap={2}>
								<HStack gap={1.5} minW={0}>
									<StratumDot color={spec.stratum.color} />
									<Text truncate>{spec.name}</Text>
								</HStack>
								<Text fontVariantNumeric="tabular-nums">{count}</Text>
							</HStack>
						))}
					</Stack>
				</Section>
			)}
		</Stack>
	);
}

// Memoizado: el diseñador se re-renderiza en cada cuadro de un arrastre.
export default memo(AnalysisPanel);
