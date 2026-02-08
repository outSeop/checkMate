import { loginWithSocial } from './actions'
import styles from './Login.module.css'

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div>
                    <h2 className={styles.title}>
                        스터디에 참여하세요
                    </h2>
                    <p className={styles.subtitle}>
                        로그인하여 스터디 관리와 벌금 정산을 시작하세요.
                    </p>
                </div>

                <div className={styles.buttonGroup}>
                    <form action={loginWithSocial.bind(null, 'kakao')}>
                        <button className={`${styles.socialButton} ${styles.kakao}`}>
                            카카오로 시작하기
                        </button>
                    </form>

                    <form action={loginWithSocial.bind(null, 'google')}>
                        <button className={`${styles.socialButton} ${styles.google}`}>
                            Google로 시작하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
