import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { NextComponentType } from "next";
import style from '../styles/Home.module.css'

export default function withLayout(Component: NextComponentType, title: string) {
  return function PageWithLayout() {
    return (
      <div className={style.container}>
        <Head>
          <title>SAF Hub | {title}</title>
          <meta name="description" content="Información completa para la creación de sistemas agroforestales" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav />
        <Component />
        <Footer />
      </div>
    );
  }
}