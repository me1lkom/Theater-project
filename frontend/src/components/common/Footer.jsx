import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import max from "../../assets/icon/max.svg";
import tg from "../../assets/icon/tg.svg";
import vk from "../../assets/icon/vk.svg";
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftBlock}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="Логотип театра" />
          </Link>
        </div>
        <div className={styles.social}>
          <a href="#"><img src={max} alt="max" /></a>
          <a href="#"><img src={vk} alt="vk" /></a>
          <a href="#"><img src={tg} alt="tg" /></a>
        </div>
      </div>
      <div className={styles.rightBlock}>
        <nav className={styles.nav}>
          <ul className={styles.nav__list}>
            <li><Link to="/">Афиша</Link></li>
            <li><Link to="/contact">Контакты</Link></li>
            <li><Link to="/panorama">Панорама</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}