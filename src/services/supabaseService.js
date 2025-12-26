import { supabase } from '../supabaseClient';

export const supabaseService = {
    /**
     * Fetch sessions for a specific date range
     */
    async fetchCoachSchedule(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString())
                .order('time', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return [];
        }
    },

    /**
     * Fetch the roster (students) for a specific session
     * Assumes a 'session_enrollments' or similar join table exists, 
     * or players have a 'session_id'. 
     * For V1/Simple systems: checks 'players' table where 'session_id' matches.
     */
    async fetchSessionRoster(sessionId) {
        try {
            // Join with profiles/players to get names/avatars
            // Adjust table names based on your actual schema
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    status,
                    student:students (
                        id,
                        full_name,
                        level,
                        avatar_url
                    )
                `)
                .eq('session_id', sessionId);

            if (error) throw error;

            // Transform to friendly format
            return data.map(record => ({
                id: record.student.id,
                name: record.student.full_name,
                avatar: record.student.avatar_url,
                level: record.student.level,
                status: record.status || 'unknown'
            }));
        } catch (error) {
            console.warn('Error fetching roster (MOCK FALLBACK applied):', error);
            // Fallback for demo if table missing
            return null;
        }
    },

    /**
     * Update attendance status
     */
    async updateAttendance(enrollmentId, status) {
        const { error } = await supabase
            .from('enrollments')
            .update({ status })
            .eq('id', enrollmentId);

        if (error) throw error;
    }
};
