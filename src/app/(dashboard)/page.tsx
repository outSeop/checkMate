import styles from './Dashboard.module.css'

export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    내 스터디
                </h1>
                <a href="/create-room" className={styles.createButton}>
                    + 새 스터디
                </a>
            </div>
            <div className={styles.grid}>
                {/* Placeholder cards */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>알고리즘 스터디</h3>
                    <p className={styles.cardDesc}>
                        매일 1문제 풀기
                    </p>
                    <div className={styles.cardFooter}>
                        멤버 4명 · 진행 중
                    </div>
                </div>
            </div>
        </div>
    )
}
