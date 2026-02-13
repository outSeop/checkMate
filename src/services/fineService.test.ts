import { describe, it, expect, vi, beforeEach } from 'vitest'
import { markFineAsPaid, confirmFinePayment } from './fineService'

// Mock Supabase
const mockUpdate = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockSelect = vi.fn().mockReturnThis()
const mockSingle = vi.fn()

const mockSupabase = {
    from: vi.fn(() => ({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
    })),
}

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe('FineService Payment Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('markFineAsPaid', () => {
        it('should update fine status to PAID', async () => {
            mockUpdate.mockReturnValue({
                eq: mockEq,
            })
            mockEq.mockReturnValue({
                select: mockSelect
            })
            mockSelect.mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'fine_123', status: 'PAID' }, error: null })
            })

            const result = await markFineAsPaid('fine_123')

            expect(mockSupabase.from).toHaveBeenCalledWith('fines')
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'PAID' })
            expect(mockEq).toHaveBeenCalledWith('id', 'fine_123')
            expect(result.success).toBe(true)
        })
    })

    describe('confirmFinePayment', () => {
        it('should update fine status to CONFIRM', async () => {
            mockUpdate.mockReturnValue({
                eq: mockEq,
            })
            mockEq.mockReturnValue({
                select: mockSelect
            })
            mockSelect.mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'fine_123', status: 'CONFIRMED' }, error: null })
            })

            const result = await confirmFinePayment('fine_123')

            expect(mockSupabase.from).toHaveBeenCalledWith('fines')
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'CONFIRMED' }) // Or PAID depending on schema
            expect(mockEq).toHaveBeenCalledWith('id', 'fine_123')
            expect(result.success).toBe(true)
        })
    })
})
