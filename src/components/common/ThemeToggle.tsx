'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Using resolvedTheme ensures we know if it's light or dark when "system" is selected
    const currentTheme = theme === 'system' ? resolvedTheme : theme

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                }}
                disabled
            >
                <div style={{ width: 24, height: 24 }} />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
            }}
        >
            {currentTheme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
    )
}
