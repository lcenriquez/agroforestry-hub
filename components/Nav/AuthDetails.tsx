import { AddIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthDetails() {
  const { authUser } = useAuth();

  return <>{authUser ? <Authed /> : <NoAuth />}</>;
}

function NoAuth() {
  return (
    <>
      <Button
        as='a'
        fontSize='sm'
        fontWeight={400}
        variant='link'
        href='/signin'
      >
        Iniciar sesión
      </Button>
      <Button
        as='a'
        display={{ base: 'none', md: 'inline-flex' }}
        fontSize='sm'
        fontWeight={600}
        color='white'
        bg='pink.400'
        href='/signup'
        _hover={{
          bg: 'pink.300',
        }}
      >
        Registrarse
      </Button>
    </>
  );
}

function Authed() {
  const { signOut } = useAuth();

  return (
    <Menu>
      <MenuButton
        as={Button}
        rounded={'full'}
        variant={'link'}
        cursor={'pointer'}
        minW={0}
      >
        <Avatar
          size={'sm'}
          // To do: show user's profile picture
          // src={
          //   'https://unsplash.com/photos/q4g5quLfNkI/download?force=true&w=640'
          // }
        />
      </MenuButton>
      <MenuList>
        <MenuItem>Mi perfil</MenuItem>
        <MenuItem>Configuración</MenuItem>
        <MenuDivider />
        <MenuItem onClick={signOut}>Cerrar sesión</MenuItem>
      </MenuList>
    </Menu>
  );
}
