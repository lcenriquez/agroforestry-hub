import { Table, TableCaption, Text, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { AdditionalFunctionIconRepresentation, EcologicalFunctionIconRepresentation, SingleCharRepresentation } from '../Helpers/VisualRepresentations';

export default function SpeciesTable({ species }: any) {
  console.log(species);
  
  return (
    <Table variant='striped'>
      <TableCaption>Especies mostradas según región: mx</TableCaption>
      <Thead>
        <Tr>
          <Th>Nombre (científico y común)</Th>
          <Th>Zona ecológica</Th>
          <Th>Estrato</Th>
          <Th>Altura</Th>
          <Th>Ancho de copa</Th>
          <Th>Funciones ecológicas</Th>
        </Tr>
      </Thead>
      <Tbody>
        {species?.map((sp: any) => {
          return (
            <Tr key={sp.id}>
              <Td>
                <Text>{`${sp.taxonomy.genus} ${sp.taxonomy.species}`}</Text>
                <Text fontSize='small' fontStyle='italic'>{sp.commonNames.es_mx?.join(', ')}</Text>
              </Td>
              <Td>{sp.ecologicalZones.mx.map((z: any) => <SingleCharRepresentation key={z.id} value={z} />)}</Td>
              <Td>{sp.stratums.map((s: any) => <SingleCharRepresentation key={s.id} value={s} name={s.name.es_mx[0]} />)}</Td>
              <Td>{`${sp.height.min}-${sp.height.max}`}</Td>
              <Td>{`${sp.crownWidth.min}-${sp.crownWidth.max}`}</Td>
              <Td>{sp.ecologicalFunctions.map((f: any) => <EcologicalFunctionIconRepresentation key={f.id} value={f} />)}</Td>
            </Tr>)
        })}
      </Tbody>
    </Table>
  );
}