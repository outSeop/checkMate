export const MAX_ROOM_NAME_LENGTH = 50
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_NOTICE_LENGTH = 2000
export const MAX_REASON_LENGTH = 200
export const MAX_MESSAGE_LENGTH = 200
export const MAX_FINE_AMOUNT = 1_000_000
export const MIN_FINE_AMOUNT = 100

export function sanitizeText(input: string): string {
    return input.trim()
}

export function validateRoomName(name: string): string | null {
    if (!name || name.trim().length === 0) return '스터디 이름을 입력해주세요.'
    if (name.length > MAX_ROOM_NAME_LENGTH) return `스터디 이름은 ${MAX_ROOM_NAME_LENGTH}자 이하로 입력해주세요.`
    return null
}

export function validateFineAmount(amount: number): string | null {
    if (!Number.isFinite(amount) || !Number.isInteger(amount)) return '금액은 정수여야 합니다.'
    if (amount < MIN_FINE_AMOUNT) return `금액은 ${MIN_FINE_AMOUNT}원 이상이어야 합니다.`
    if (amount > MAX_FINE_AMOUNT) return `금액은 ${MAX_FINE_AMOUNT.toLocaleString()}원 이하여야 합니다.`
    return null
}

export function validateRequired(value: string | undefined | null, fieldName: string): string | null {
    if (!value || value.trim().length === 0) return `${fieldName}을(를) 입력해주세요.`
    return null
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value.length > maxLength) return `${fieldName}은(는) ${maxLength}자 이하로 입력해주세요.`
    return null
}
