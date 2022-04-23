import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { NextComponentType } from 'next';

export default function withLayout(Component: NextComponentType, title: string) {
  return function PageWithLayout() {
    return (
      <Box position='relative' height='100vh'>
        <Head>
          <title>SAF Hub | {title}</title>
          <meta name='description' content='Información completa para la creación de sistemas agroforestales' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Nav />
        <Component />
        <Footer />
      </Box>
    );
  }
}