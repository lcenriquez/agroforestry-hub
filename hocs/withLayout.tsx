import { Alert, AlertIcon, Box, Container, Heading } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import LoadingScreen from '../components/Elements/LoadingScreen';

import { NextComponentType } from 'next';

export function withPublicLayout(
  Component: NextComponentType,
  title: string,
  pageTitle?: string
) {
  const appEnvName = process.env.NEXT_PUBLIC_ENVIRONMENT_NAME
    ? `[${process.env.NEXT_PUBLIC_ENVIRONMENT_NAME}]`
    : '';

  return function PageWithLayout() {
    return (
      <Box height='100vh' display='flex' flexDirection='column'>
        <Head>
          <title>{'SAF Hub' + appEnvName + ' | ' + title}</title>
          <meta
            name='description'
            content='Información completa para la creación de sistemas agroforestales'
          />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Nav />
        {pageTitle && pageTitle !== '' ? (
          <Container maxW='container.xl' pb='2em'>
            <Heading my={{ base: 4 }}>{pageTitle}</Heading>
            <Component />
          </Container>
        ) : (
          <Component />
        )}
        <Footer />
      </Box>
    );
  };
}

export function withAuthedLayout(Component: NextComponentType, title: string) {
  const appEnvName = process.env.NEXT_PUBLIC_ENVIRONMENT_NAME
    ? `[${process.env.NEXT_PUBLIC_ENVIRONMENT_NAME}]`
    : '';

  return function PageWithLayout() {
    const router = useRouter();
    const { authUser, loading } = useAuth();

    // Listen for changes on loading and authUser, redirect if needed
    useEffect(() => {
      if (!loading && !authUser)
        router.push({
          pathname: '/signin',
          query:
            router.pathname !== '/app/dashboard'
              ? {
                  from: router.pathname,
                }
              : '',
        });
    }, [authUser, loading, router]);

    if (!authUser) return <LoadingScreen />;

    return (
      <Box height='100vh' display='flex' flexDirection='column'>
        <Head>
          <title>{'SAF Hub' + appEnvName + ' | ' + title}</title>
          <meta
            name='description'
            content='Información completa para la creación de sistemas agroforestales'
          />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        {!authUser.isEmailVerified && (
          <Alert status='warning' justifyContent='center'>
            <AlertIcon />
            Verifica tu correo electrónico para comenzar a utilizar tu cuenta
          </Alert>
        )}
        <Nav />
        <Container maxW='container.xl' pb='2em'>
          <Heading my={{ base: 4 }}>{title}</Heading>
          <Component />
        </Container>
        <Footer />
      </Box>
    );
  };
}

export function withEmptyLayout(Component: NextComponentType, title: string) {
  const appEnvName = process.env.NEXT_PUBLIC_ENVIRONMENT_NAME
    ? `[${process.env.NEXT_PUBLIC_ENVIRONMENT_NAME}]`
    : '';

  return function PageWithLayout() {
    return (
      <>
        <Head>
          <title>{'SAF Hub' + appEnvName + ' | ' + title}</title>
          <meta
            name='description'
            content='Información completa para la creación de sistemas agroforestales'
          />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Component />
      </>
    );
  };
}
