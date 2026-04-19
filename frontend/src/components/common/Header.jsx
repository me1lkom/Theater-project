import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import logo from "../../assets/logo.svg";
import styles from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const handleLoginClick = () => {
    navigate(`/auth`)
  };

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const handleAdminClick = () => {
    navigate(`/admin`);
  }


  return (
    <header className={styles.header}>
      <div className={styles.header__logo}>
        <Link to="/">
          <img src={logo} alt="Логотип театра" />
        </Link>
      </div>

      <nav className={styles.header__nav}>
        <ul className={styles.nav__list}>
          <li><Link to="/">Афиша</Link></li>
          <li><Link to="/contact">Контакты</Link></li>
          <li><Link to="/panorama">Панорама</Link></li>
        </ul>
      </nav>

      <div className={styles.header__actions}>
        {isAuthenticated ? (
          <button
            className={styles.actions__button}
            onClick={handleProfileClick}
            aria-label="Профиль"
          >
            Профиль
          </button>
        ) : (
          <button
            className={`${styles.actions__button} ${styles.notAuth}`}
            onClick={handleLoginClick}
            aria-label="Войти"
          >
            Войти
          </button>
        )}

        {user?.role === 'admin' && (
          <>
            <button
              className={`${styles.actions__button} ${styles['actions__button--admin']}`}
              onClick={handleAdminClick}
              aria-label="Админ панель"
            >
              Админ панель
            </button>
          </>
        )}
      </div>
    </header>
  );
}

