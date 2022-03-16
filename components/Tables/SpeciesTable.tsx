import { Table, TableCaption, Text, Thead, Tbody, Tr, Th, Td, Box, Tooltip } from '@chakra-ui/react'

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
              <Td>{sp.ecologicalZones.mx.map((z: any) => <SingleCharValue key={z.id} value={z} />)}</Td>
              <Td>{sp.stratums.map((s: any) => <SingleCharValue key={s.id} value={s} name={s.name.es_mx[0]} />)}</Td>
              <Td>{`${sp.height.min}-${sp.height.max}`}</Td>
              <Td>{`${sp.crownWidth.min}-${sp.crownWidth.max}`}</Td>
            </Tr>)
        })}
      </Tbody>
    </Table>
  );
}

function SingleCharValue({value, name}: any) {
  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline'>{name || value.id}</Box>
    </Tooltip>
  );
}