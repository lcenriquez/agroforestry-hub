import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Documentation for custom functionality: https://firebase.google.com/docs/auth/custom-email-handler

export default function AccountAction() {
  const router = useRouter();
  const [ mode, setMode ] = useState('');
  const { mode: qMode } = router.query;

  useEffect(() => {
    if (!mode) setMode(qMode as string);
  },[mode, qMode, router])

  return (
    <Flex
      minH='100vh'
      align='center'
      justify='center'
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box
        justifyContent='center'
        rounded='lg'
        bg={useColorModeValue('white', 'gray.700')}
        boxShadow='lg'
        p={8}
      >
        <Text>{mode !== '' && mode}</Text>
      </Box>
    </Flex>
  );
}