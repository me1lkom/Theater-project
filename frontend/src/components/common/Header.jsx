import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";


export default function Header() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const handleLogoClick = () => {
    navigate(`/`);
  };

  const handleLoginClick = () => {
    navigate(`/auth`)
  };

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const handleContactClick = () => {
    navigate(`/contact`);
  };

  const handlePanoramaClick = () => {
    navigate(`/panorama`);
  };

  const handleStatisticClick = () => {
    navigate(`/statistics`);
  }

  return (
    <header>
      <div onClick={handleLogoClick}>Логотип</div>
      <nav>Меню
        {isAuthenticated ? (
          <span>
            <span>Привет, {user?.username}!</span>
            <button onClick={handleProfileClick}>Профиль</button>
            <button onClick={handleContactClick}>Контакты</button>
            <button onClick={handlePanoramaClick}>Панорама</button>
          </span>
        ) : (
          <button onClick={handleLoginClick}>Войти</button>
        )}
        {user?.role == 'admin' ? (
          <button onClick={handleStatisticClick}>Статистика</button>
        ): (
          null
        )}
      </nav>

    </header>
  );
}

