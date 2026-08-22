import { Table, Text } from '@chakra-ui/react';

import {
	AdditionalFunctionIconRepresentation,
	DetailIconRepresentation,
	EcologicalFunctionIconRepresentation,
	SingleCharRepresentation
} from '../Helpers/VisualRepresentations';

export default function SpeciesTable({ species }: any) {
	return (
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
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{species?.map((sp: any) => {
					return (
						<Table.Row key={sp._id}>
							<Table.Cell>
								<Text>{`${sp.taxonomy.genus} ${sp.taxonomy.species}`}</Text>
								<Text fontSize="0.7rem" fontStyle="italic">
									{sp.commonNames.es_mx?.join(', ')}
								</Text>
							</Table.Cell>
							<Table.Cell>
								{sp.ecologicalZones.mx.map((z: any) => (
									<SingleCharRepresentation key={z._id} value={z} />
								))}
							</Table.Cell>
							<Table.Cell>
								{sp.stratums.map((s: any) => (
									<SingleCharRepresentation key={s._id} value={s} />
								))}
							</Table.Cell>
							<Table.Cell>{`${sp.height.min}-${sp.height.max}`}</Table.Cell>
							<Table.Cell>{`${sp.crownWidth.min}-${sp.crownWidth.max}`}</Table.Cell>
							<Table.Cell>
								{sp.ecologicalFunctions.map((f: any) => (
									<EcologicalFunctionIconRepresentation key={f._id} value={f} />
								))}
							</Table.Cell>
							<Table.Cell>
								{sp.additionalFunctions.map((f: any) => (
									<AdditionalFunctionIconRepresentation key={f._id} value={f} />
								))}
							</Table.Cell>
							<Table.Cell>
								{sp.details &&
									Object.keys(sp.details).map((key: string) => <DetailIconRepresentation key={key} idKey={key} value={sp.details[key]} />)}
							</Table.Cell>
						</Table.Row>
					);
				})}
			</Table.Body>
		</Table.Root>
	);
}
