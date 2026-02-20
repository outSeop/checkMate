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
                    <form action={loginWithSocial.bind(null, 'kakao')} style={{ width: '100%' }}>
                        <button className={`${styles.socialButton} ${styles.kakao}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C6.477 3 2 6.641 2 11.135C2 13.518 3.204 15.65 5.093 17.03L4 21L8.214 18.273C9.408 18.73 10.678 19 12 19C17.523 19 22 15.359 22 10.865C22 6.371 17.523 3 12 3Z" />
                            </svg>
                            카카오로 시작하기
                        </button>
                    </form>

                    <form action={loginWithSocial.bind(null, 'google')} style={{ width: '100%' }}>
                        <button className={`${styles.socialButton} ${styles.google}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google로 시작하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
