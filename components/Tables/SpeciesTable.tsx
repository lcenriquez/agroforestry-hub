import { Table, TableCaption, Text, Thead, Tbody, Tr, Th, Td, Box, Tooltip } from '@chakra-ui/react'
import { Atom, ForkKnife, Graph, Leaf, Mountains, Question } from 'phosphor-react';

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
          <Th>Funciones</Th>
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
              <Td>{sp.ecologicalFunctions.map((f: any) => <IconRepresentation key={f.id} value={f} />)}</Td>
            </Tr>)
        })}
      </Tbody>
    </Table>
  );
}

function IconRepresentation({value}: any) {
  let icon;
  switch(+value.id) {
    case 0:
      icon = <Leaf /> // Biomass
      break;
    case 1:
      icon = <Graph /> // Nitrogen fixation
      break;
    case 2:
      icon = <Atom /> // Nutrient accumulation
      break;
    case 3:
      icon = <Mountains /> // Erotion control
      break;
    case 4:
      icon = <ForkKnife /> // Food
      break;
    default:
      icon = <Question />
      break;
  }

  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>{icon}</Box>
    </Tooltip>
  );
}

function SingleCharValue({value, name}: any) {
  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>{name || value.id}</Box>
    </Tooltip>
  );
}