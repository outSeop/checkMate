
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
    const [data, setData] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase.from('rooms').select('*');
            if (error) setError(error.message);
            else setData(data);
        }
        fetchData();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Supabase Connection Test</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
