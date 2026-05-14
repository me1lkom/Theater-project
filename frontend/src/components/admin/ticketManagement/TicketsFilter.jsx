import styles from "./TicketsFilter.module.css";

export default function TicketsFilter({
  searchPhone, onPhoneChange,
  searchEmail, onEmailChange,
  searchTicketId, onTicketIdChange,
  searchPurchaseDate, onPurchaseDateChange,
}) {

  return (
    <div className={styles.playFilter}>
      <input
        type="text"
        placeholder="id билета..."
        value={searchTicketId}
        onChange={(e) => onTicketIdChange(e.target.value)}
      />

      <input
        name="date"
        type="date"
        placeholder="Дата (YYYY-MM-DD)"
        value={searchPurchaseDate}
        onChange={(e) => onPurchaseDateChange(e.target.value)}
      />

      <input
        type="phone"
        placeholder="Номер телефона..."
        value={searchPhone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />

      <input
        type="email"
        placeholder="email..."
        value={searchEmail}
        onChange={(e) => onEmailChange(e.target.value)}
      />

    </div>
  );
}