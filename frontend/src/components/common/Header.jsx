import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(`/`);
  };

  return (
    <header>
      <div onClick={handleLogoClick}>Логотип</div>
      <nav>Меню</nav>
    </header>
  );
}

