import { Flex, Spinner } from '@chakra-ui/react'

export default function LoadingScreen() {
  return (
    <Flex minH='100vh' align='center' justify='center'>
      <Spinner size='xl' />
    </Flex>
  );
}
