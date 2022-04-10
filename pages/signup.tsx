import {
  Alert,
  AlertIcon,
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function SignupCard() {
  const router = useRouter();
  const [ input, setInput ] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { authUser, loading, error, signUp } = useAuth();

  useEffect(() => {
    if (!loading && authUser && !error) router.push('/');
  }, [authUser, loading, error, router])

  function handleSumbit(event: any) {
    event.preventDefault();
    signUp(input.email, input.password, `${input.firstName} ${input.lastName}`);
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
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={5} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl' textAlign='center'>Regístrate</Heading>
          <Text>o <Link color='blue.400' alignSelf='center' href='/'>volver al inicio</Link></Text>
        </Stack>
        <Box
          rounded='lg'
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow='lg'
          p={8}>
          <form onSubmit={(e) => handleSumbit(e)}>
            <Stack spacing={4}>
              <HStack>
                <Box>
                  <FormControl id='firstName' isRequired>
                    <FormLabel>Nombre</FormLabel>
                    <Input type='text' name='firstName' required onChange={(e) => handleChange(e)} />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl id='lastName' isRequired>
                    <FormLabel>Apellido</FormLabel>
                    <Input type='text' name='lastName' required onChange={(e) => handleChange(e)} />
                  </FormControl>
                </Box>
              </HStack>
              <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type='email' name='email' required onChange={(e) => handleChange(e)} />
              </FormControl>
              <FormControl id='password' isRequired>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <Input type={ showPassword ? 'text' : 'password' } name='password' required onChange={(e) => handleChange(e)} />
                  <InputRightElement h='full'>
                    <Button
                      variant='ghost'
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }>
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                { error &&
                  <Alert status='error'>
                    <AlertIcon />
                    <small>{ error.message }</small>
                  </Alert>
                }
                <Button
                  type='submit'
                  loadingText='Procesando'
                  size='lg'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  isLoading={loading}
                >
                  Registrarme
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align='center'>
                  ¿Ya tienes cuenta? <Link color='blue.400' href='/signin'>Inicia sesión</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}