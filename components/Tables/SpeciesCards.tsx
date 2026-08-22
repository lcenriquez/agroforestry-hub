import NextLink from 'next/link';

import { Badge, Card, Heading, HStack, Link, Stack, Text, Wrap } from '@chakra-ui/react';

import { DISPLAYABLE_DETAIL_KEYS, formatSpeciesDetail } from '../Helpers/VisualRepresentations';

import type { SpeciesType } from '../../interfaces/Species';

// Alternativa a la tabla para pantallas chicas: en vez de íconos (que dependen
// de un tooltip por hover, inútil en táctil), aquí se listan los nombres en
// texto plano, así no depende de la leyenda para ser legible.
export default function SpeciesCards({ species }: { species: SpeciesType[] }) {
	return (
		<Stack gap={3} display={{ base: 'flex', md: 'none' }}>
			{species.map(sp => (
				<Card.Root key={sp._id}>
					<Card.Body gap={2}>
						<Heading size="sm">{`${sp.taxonomy.genus} ${sp.taxonomy.species}`}</Heading>
						{sp.commonNames.es_mx && sp.commonNames.es_mx.length > 0 && (
							<Text fontSize="sm" fontStyle="italic" color="fg.muted">
								{sp.commonNames.es_mx.join(', ')}
							</Text>
						)}

						<HStack fontSize="sm" color="fg.muted" gap={4}>
							<Text>Altura: {`${sp.height.min}-${sp.height.max}m`}</Text>
							<Text>Copa: {`${sp.crownWidth.min}-${sp.crownWidth.max}m`}</Text>
						</HStack>

						<Wrap gap={1}>
							{sp.stratums.map(s => (
								<Badge key={s._id} size="sm">
									Estrato {s._id}
								</Badge>
							))}
							{sp.ecologicalZones.mx.map(z => (
								<Badge key={z._id} size="sm" colorPalette="teal">
									{z.name.es_mx}
								</Badge>
							))}
						</Wrap>

						{sp.ecologicalFunctions.length > 0 && (
							<Text fontSize="sm">
								<Text as="span" fontWeight="medium">
									Funciones ecológicas:{' '}
								</Text>
								{sp.ecologicalFunctions.map(f => f.name.es_mx).join(', ')}
							</Text>
						)}

						{sp.additionalFunctions.length > 0 && (
							<Text fontSize="sm">
								<Text as="span" fontWeight="medium">
									Otras funciones:{' '}
								</Text>
								{sp.additionalFunctions.map(f => f.name.es_mx).join(', ')}
							</Text>
						)}

						{sp.details && (
							<Text fontSize="sm">
								<Text as="span" fontWeight="medium">
									Detalles:{' '}
								</Text>
								{DISPLAYABLE_DETAIL_KEYS.filter(key => sp.details![key])
									.map(key => formatSpeciesDetail(key, sp.details![key]!))
									.join(', ')}
							</Text>
						)}

						<Link asChild color="blue.400" fontSize="sm">
							<NextLink href={`/species?id=${sp._id}`}>Ver experiencias</NextLink>
						</Link>
					</Card.Body>
				</Card.Root>
			))}
		</Stack>
	);
}
