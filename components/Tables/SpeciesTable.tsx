import NextLink from 'next/link';

import { Link, Table, Text } from '@chakra-ui/react';

import {
	AdditionalFunctionIconRepresentation,
	DetailIconRepresentation,
	EcologicalFunctionIconRepresentation,
	SingleCharRepresentation
} from '../Helpers/VisualRepresentations';

import type { SpeciesDetails, SpeciesType } from '../../interfaces/Species';

export default function SpeciesTable({ species }: { species: SpeciesType[] }) {
	return (
		<Table.ScrollArea display={{ base: 'none', md: 'block' }}>
			<Table.Root striped size="sm">
				<Table.Caption>Especies mostradas según región: mx. Todas las medidas están dadas en metros.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>Nombre (científico y común)</Table.ColumnHeader>
						<Table.ColumnHeader>Zona ecológica</Table.ColumnHeader>
						<Table.ColumnHeader>Estrato</Table.ColumnHeader>
						<Table.ColumnHeader>Altura</Table.ColumnHeader>
						<Table.ColumnHeader>Ancho de copa</Table.ColumnHeader>
						<Table.ColumnHeader>Funciones ecológicas</Table.ColumnHeader>
						<Table.ColumnHeader>Otras funciones</Table.ColumnHeader>
						<Table.ColumnHeader>Detalles</Table.ColumnHeader>
						<Table.ColumnHeader>Experiencias</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{species?.map(sp => {
						return (
							<Table.Row key={sp._id}>
								<Table.Cell>
									<Text>{`${sp.taxonomy.genus} ${sp.taxonomy.species}`}</Text>
									<Text fontSize="0.7rem" fontStyle="italic">
										{sp.commonNames.es_mx?.join(', ')}
									</Text>
								</Table.Cell>
								<Table.Cell>
									{sp.ecologicalZones.mx.map(z => (
										<SingleCharRepresentation key={z._id} value={z} />
									))}
								</Table.Cell>
								<Table.Cell>
									{sp.stratums.map(s => (
										<SingleCharRepresentation key={s._id} value={s} />
									))}
								</Table.Cell>
								<Table.Cell>{`${sp.height.min}-${sp.height.max}`}</Table.Cell>
								<Table.Cell>{`${sp.crownWidth.min}-${sp.crownWidth.max}`}</Table.Cell>
								<Table.Cell>
									{sp.ecologicalFunctions.map(f => (
										<EcologicalFunctionIconRepresentation key={f._id} value={f} />
									))}
								</Table.Cell>
								<Table.Cell>
									{sp.additionalFunctions.map(f => (
										<AdditionalFunctionIconRepresentation key={f._id} value={f} />
									))}
								</Table.Cell>
								<Table.Cell>
									{sp.details &&
										(Object.keys(sp.details) as (keyof SpeciesDetails)[]).map(key => (
											<DetailIconRepresentation key={key} idKey={key} value={sp.details![key]!} />
										))}
								</Table.Cell>
								<Table.Cell>
									<Link asChild color="blue.400">
										<NextLink href={`/species?id=${sp._id}`}>Ver experiencias</NextLink>
									</Link>
								</Table.Cell>
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table.Root>
		</Table.ScrollArea>
	);
}
