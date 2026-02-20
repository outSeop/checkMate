'use client'

import { Star } from 'lucide-react'

export default function PointsBadge({ points }: { points: number }) {
    if (points <= 0) return null

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'hsl(45, 93%, 47%)',
            backgroundColor: 'hsl(45, 93%, 95%)',
            padding: '0.2rem 0.5rem',
            borderRadius: '99px',
        }}>
            <Star size={12} fill="hsl(45, 93%, 47%)" />
            {points.toLocaleString()}P
        </div>
    )
}
