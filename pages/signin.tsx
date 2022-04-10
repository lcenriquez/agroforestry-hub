import {
  Alert,
  AlertIcon,
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const router = useRouter();
  const [ input, setInput ] = useState({ email: '', password: '' });
  const { authUser, loading, error, signIn } = useAuth();

  useEffect(() => {
    if (!loading && authUser && !error) router.push('/');
  }, [authUser, loading, error, router])

  function handleSumbit(event: any) {
    event.preventDefault();
    signIn(input.email, input.password);
  }

  function handleChange(event: any) {
    event.preventDefault();
    setInput({...input, [event.target.name]: event.target.value})
  }

  return (
    <Flex
      minH='100vh'
      align='center'
      justify='center'
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={5} mx='auto' w='sm' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>Inicia sesión</Heading>
          <Text>o <Link color='blue.400' alignSelf='center' href='/'>volver al inicio</Link></Text>
        </Stack>
        <Box
          rounded='lg'
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow='lg'
          p={8}
        >
          <form onSubmit={(e) => handleSumbit(e)}>
            <Stack spacing={4}>
              <FormControl id='email'>
                <FormLabel>Correo electrónico</FormLabel>
                <Input type='email' name='email' required onChange={(e) => handleChange(e)} />
              </FormControl>
              <FormControl id='password'>
                <FormLabel>Contraseña</FormLabel>
                <Input type='password' name='password' required onChange={(e) => handleChange(e)} />
              </FormControl>
              <Stack spacing={5}>
                { error &&
                  <Alert status='error'>
                    <AlertIcon />
                    <small>{ error.message }</small>
                  </Alert>
                }
                <Link color='blue.400'>¿Olvidaste tu contraseña?</Link>
                <Button
                  type='submit'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  isLoading={loading}
                >
                  Ingresar
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}