import { Box, Tooltip } from '@chakra-ui/react';
import {
  Atom,
  Butterfly,
  DropHalfBottom,
  ForkKnife,
  Graph,
  Heartbeat,
  Horse,
  Leaf,
  Mountains,
  Question,
  Snowflake,
  Sun,
  Tree,
} from 'phosphor-react';

export function EcologicalFunctionIconRepresentation({ value }: any) {
  let icon;
  switch (+value._id) {
    case 0:
      icon = <Leaf />; // Biomass
      break;
    case 1:
      icon = <Graph />; // Nitrogen fixation
      break;
    case 2:
      icon = <Atom />; // Nutrient accumulation
      break;
    case 3:
      icon = <Mountains />; // Erotion control
      break;
    case 4:
      icon = <Butterfly />; // Pollinators
      break;
    default:
      icon = <Question />;
      break;
  }

  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>
        {icon}
      </Box>
    </Tooltip>
  );
}

export function AdditionalFunctionIconRepresentation({ value }: any) {
  let icon;
  switch (+value._id) {
    case 0:
      icon = <ForkKnife />; // Food
      break;
    case 1:
      icon = <Horse />; // Forage
      break;
    case 2:
      icon = <Tree />; // Wood
      break;
    case 3:
      icon = <Heartbeat />; // Medicinal
      break;
    default:
      icon = <Question />;
      break;
  }

  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>
        {icon}
      </Box>
    </Tooltip>
  );
}

export function SingleCharRepresentation({ value, name }: any) {
  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>
        {name || value._id}
      </Box>
    </Tooltip>
  );
}

export function DetailIconRepresentation({ idKey, value }: any) {
  let icon;
  let caption: string;
  switch (idKey) {
    case 'isFrostResistant':
      icon = <Snowflake />;
      caption = 'Resiste heladas';
      break;
    case 'lightPreference':
      icon = <Sun />;
      value === 'H'
        ? (caption = 'Prefiere sol')
        : value === 'M'
        ? (caption = 'Prefiere media sombra')
        : (caption = 'Prefiere sombra');
      break;
    case 'nutrientExtraction':
      icon = <Atom />;
      value === 'H'
        ? (caption = 'Alta extracción de nutrientes')
        : value === 'M'
        ? (caption = 'Extracción media de nutrientes')
        : (caption = 'Baja extracción de nutrientes');
      break;
    case 'humidityPreference':
      icon = <DropHalfBottom />;
      value === 'H'
        ? (caption = 'Prefiere humedad alta')
        : value === 'M'
        ? (caption = 'Prefiere humedad media')
        : (caption = 'Prefiere clima seco');
      break;
    default:
      icon = <Question />;
      caption = '';
      break;
  }

  return (
    <Tooltip label={caption}>
      <Box cursor='default' display='inline-flex' mx='1px'>
        {icon}
      </Box>
    </Tooltip>
  );
}
