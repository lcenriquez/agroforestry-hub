import { Container, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getSpecies } from '../adapters/firestore'
import SpeciesTable from '../components/Tables/SpeciesTable';
import withLayout from '../hocs/withLayout';
import type { NextPage } from 'next'


const Home: NextPage = () => {
  const [ species, setSpecies ] = useState<{}[]>([]);

  useEffect(() => {
    const firstLoad = async () => {
      if (species.length === 0) setSpecies(await getSpecies());
    }
    firstLoad();
  },[species]);

  return (
    <Container maxW='container.xl'>
      <Heading>Sistemas agroforestales</Heading>
      {species.length > 0 ? <SpeciesTable species={species} /> : null}
    </Container>
  )
}

// export async function getServerSideProps() {
//   return {
//     props: {}, // will be passed to the page component as props
//   }
// }

export default withLayout(Home, 'Toda la información que necesitas sobre SAFs');