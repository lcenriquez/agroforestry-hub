import type { NextPage } from 'next'
import withLayout from '../hocs/withLayout'

const Home: NextPage = () => {
  return (
    <h1>Sistemas agroforestales</h1>
  )
}

export default withLayout(Home, 'Toda la información que necesitas sobre SAFs');
