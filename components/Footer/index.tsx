import { NextPage } from "next";
import style from '../../styles/Home.module.css'

const Footer: NextPage = () => {
  return (
    <footer className={style.footer}>
      <a
        href="https://ungranitodetierra.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{" "}
        <span className={style.logo}>
          Un granito de Tierra, A.C.
        </span>
      </a>
    </footer>
  );
};

export default Footer;
