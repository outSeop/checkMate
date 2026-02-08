
'use client'

import { useActionState } from 'react'
import { createRoom } from '@/app/actions/room'
import styles from './CreateRoom.module.css'

const initialState = {
    message: '',
}

export default function CreateRoomPage() {
    const [state, formAction, pending] = useActionState(createRoom, initialState)

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>새 스터디 만들기</h1>

            <form action={formAction} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>스터디 이름 *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className={styles.input}
                        placeholder="예: 아침 기상 스터디"
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="description" className={styles.label}>설명</label>
                    <textarea
                        id="description"
                        name="description"
                        className={styles.textarea}
                        placeholder="스터디 규칙이나 목표를 적어주세요."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.field}>
                        <label htmlFor="startDate" className={styles.label}>시작일 *</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="endDate" className={styles.label}>종료일 *</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            className={styles.input}
                            required
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="communicationLink" className={styles.label}>소통 링크 (오픈채팅/디스코드)</label>
                    <input
                        type="url"
                        id="communicationLink"
                        name="communicationLink"
                        className={styles.input}
                        placeholder="https://open.kakao.com/..."
                    />
                </div>

                <div className={styles.checkboxContainer}>
                    <input
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        className={styles.checkbox}
                    />
                    <label htmlFor="isPublic" className={styles.label}>공개 스터디로 설정 (검색 노출)</label>
                </div>

                {state.message && <p className={styles.error}>{state.message}</p>}

                <button type="submit" className={styles.submitButton} disabled={pending}>
                    {pending ? '생성 중...' : '스터디 생성하기'}
                </button>
            </form>
        </div>
    )
}
