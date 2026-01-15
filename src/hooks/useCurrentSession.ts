import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Session } from '@/types/custom';

interface UseCurrentSessionReturn {
    activeSession: Session | null;
    upcomingSession: Session | null;
    loading: boolean;
    error: any;
    refresh: () => Promise<void>;
}

export const useCurrentSession = (): UseCurrentSessionReturn => {
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [upcomingSession, setUpcomingSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const { user } = useAuthStore();
    const academyId = user?.academy?.id;

    const fetchSessions = async () => {
        if (!academyId) return;

        try {
            setLoading(true);
            const today = new Date();
            const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

            // Query sessions for today, linked to this academy
            // We need to join batches to check academy_id AND get batch name
            // We also grab program color if possible (assuming program -> color)
            const { data, error: err } = await supabase
                .from('sessions')
                .select(`
                    *,
                    batch:batches!inner (
                        id,
                        name,
                        academy_id,
                        program:programs (
                            name,
                            color
                        )
                    )
                `)
                .eq('date', dateString)
                .eq('batch.academy_id', academyId)
                .order('start_time', { ascending: true });

            if (err) throw err;

            // Now determine status based on TIME
            // Times in DB are "HH:MM:SS" (Time column) usually, combined with Date.
            // OR they are partial times.
            // Let's assume start_time and end_time are Time strings like "14:00:00" or ISO.
            // Based on previous types/custom.ts: start_time: string; // ISO
            // Wait, supabase.ts says start_time: string. Usually Supabase Time column returns "HH:MM:SS".
            // If it's a timestamp column, it's ISO.
            // Let's assume it's "HH:MM:SS" given it's a `date` + `start_time` split in schema.
            // We construct full Date objects for comparison.

            const now = new Date();
            const currentTime = now.getTime();

            let active: Session | null = null;
            let next: Session | null = null;

            // Helper to parse DB time string (HH:MM:SS) into today's Date object
            const parseTime = (timeStr: string) => {
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                const d = new Date(today); // Clone today
                d.setHours(hours, minutes, seconds || 0, 0);
                return d.getTime();
            };

            // Note: If start_time is full ISO, we just use new Date(start_time).
            // But having separate `date` column implies `start_time` might be just time.
            // We will Try to detect.

            const sessions = (data as unknown as Session[]) || [];

            for (const session of sessions) {
                // Heuristic: Check if start_time contains "T" (ISO) or just ":" (Time)
                const isISO = session.start_time.includes('T');

                let startMs: number;
                let endMs: number;

                if (isISO) {
                    startMs = new Date(session.start_time).getTime();
                    endMs = new Date(session.end_time).getTime();
                } else {
                    startMs = parseTime(session.start_time);
                    endMs = parseTime(session.end_time);
                }

                // Logic:
                // Active: NOW is between Start and End (with small buffer? exact for now)
                // Upcoming: Start is AFTER NOW.

                if (currentTime >= startMs && currentTime <= endMs) {
                    active = session;
                    break; // Found active! (Assume one at a time for this user view context)
                } else if (currentTime < startMs) {
                    if (!next) next = session; // Take the first upcoming one
                }
            }

            setActiveSession(active);
            setUpcomingSession(next);

        } catch (e) {
            console.error('Error fetching current session:', e);
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();

        // Optional: Poll every minute to update status?
        const interval = setInterval(fetchSessions, 60 * 1000);
        return () => clearInterval(interval);
    }, [academyId]);

    return { activeSession, upcomingSession, loading, error, refresh: fetchSessions };
};
