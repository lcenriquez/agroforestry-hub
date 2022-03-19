import { Box, Tooltip } from '@chakra-ui/react';
import { Atom, Butterfly, ForkKnife, Graph, Heartbeat, Horse, Leaf, Mountains, Question, Tree } from 'phosphor-react';

export function EcologicalFunctionIconRepresentation({value}: any) {
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
      icon = <Butterfly /> // Pollinators
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

export function AdditionalFunctionIconRepresentation({value}: any) {
  let icon;
  switch(+value.id) {
    case 0:
      icon = <ForkKnife /> // Food
      break;
    case 1:
      icon = <Horse /> // Forage
      break;
    case 2:
      icon = <Tree /> // Wood
      break;
    case 3:
      icon = <Heartbeat /> // Medicinal
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

export function SingleCharRepresentation({value, name}: any) {
  return (
    <Tooltip label={value.name.es_mx}>
      <Box cursor='default' display='inline-flex' mx='1px'>{name || value.id}</Box>
    </Tooltip>
  );
}