import {
  Table,
  TableCaption,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  AdditionalFunctionIconRepresentation,
  DetailIconRepresentation,
  EcologicalFunctionIconRepresentation,
  SingleCharRepresentation,
} from '../Helpers/VisualRepresentations';

export default function SpeciesTable({ species }: any) {
  console.log(species);

  return (
    <Table variant='striped' size='sm'>
      <TableCaption>
        Especies mostradas según región: mx. Todas las medidas están dadas en
        metros.
      </TableCaption>
      <Thead>
        <Tr>
          <Th>Nombre (científico y común)</Th>
          <Th>Zona ecológica</Th>
          <Th>Estrato</Th>
          <Th>Altura</Th>
          <Th>Ancho de copa</Th>
          <Th>Funciones ecológicas</Th>
          <Th>Otras funciones</Th>
          <Th>Detalles</Th>
        </Tr>
      </Thead>
      <Tbody>
        {species?.map((sp: any) => {
          return (
            <Tr key={sp._id}>
              <Td>
                <Text>{`${sp.taxonomy.genus} ${sp.taxonomy.species}`}</Text>
                <Text fontSize='0.7rem' fontStyle='italic'>
                  {sp.commonNames.es_mx?.join(', ')}
                </Text>
              </Td>
              <Td>
                {sp.ecologicalZones.mx.map((z: any) => (
                  <SingleCharRepresentation key={z._id} value={z} />
                ))}
              </Td>
              <Td>
                {sp.stratums.map((s: any) => (
                  <SingleCharRepresentation key={s._id} value={s} />
                ))}
              </Td>
              <Td>{`${sp.height.min}-${sp.height.max}`}</Td>
              <Td>{`${sp.crownWidth.min}-${sp.crownWidth.max}`}</Td>
              <Td>
                {sp.ecologicalFunctions.map((f: any) => (
                  <EcologicalFunctionIconRepresentation key={f._id} value={f} />
                ))}
              </Td>
              <Td>
                {sp.additionalFunctions.map((f: any) => (
                  <AdditionalFunctionIconRepresentation key={f._id} value={f} />
                ))}
              </Td>
              <Td>
                {sp.details &&
                  Object.keys(sp.details).map((key: string) => (
                    <DetailIconRepresentation
                      key={key}
                      idKey={key}
                      value={sp.details[key]}
                    />
                  ))}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
