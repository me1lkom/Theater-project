import styles from "./RefundManagementPage.module.css";
import RequestsList from "../../components/admin/RefundManagement/RequestsList";

export default function RefundManagementPage() {
    return (
        <div className={styles.container}>
            <div className={styles.neededContainer}>
                <h1>Управление запросами на возврат</h1>
                <RequestsList />
            </div>

        </div>
    )
}