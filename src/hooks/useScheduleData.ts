import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface ScheduleData {
    branches: { id: string; name: string }[];
    settings: { weekStartDay: number; workingHours: any };
    stats: {
        totalBudget: number;
        actualCost: number;
        totalHours: number;
    };
    publishStatus: {
        hasDrafts: boolean;
        draftCount: number;
    };
    loading: boolean;
    refresh: () => void;
}

export function useScheduleData(currentDate: Date, academyId: string | null) {
    const [data, setData] = useState<ScheduleData>({
        branches: [],
        settings: { weekStartDay: 1, workingHours: {} },
        stats: { totalBudget: 0, actualCost: 0, totalHours: 0 },
        publishStatus: { hasDrafts: false, draftCount: 0 },
        loading: true,
        refresh: () => { }
    });

    const fetchSchedule = async () => {
        if (!academyId) return;

        try {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
            const end = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();

            // 1. Fetch Branches
            const { data: branches } = await supabase
                .from('locations')
                .select('id, name')
                .eq('academy_id', academyId);

            // Should seed if empty? Ideally handled by onboarding, but for now just return what exists.

            // 2. Fetch Shifts (Visible Week)
            const { data: shifts } = await supabase
                .from('staff_shifts')
                .select('id, status, cost_estimate, start_time, end_time')
                .eq('academy_id', academyId)
                .gte('start_time', start)
                .lte('start_time', end);

            // 3. Calculate Stats
            let totalBudget = 0;
            let draftCount = 0;
            let totalHours = 0;

            shifts?.forEach(shift => {
                totalBudget += Number(shift.cost_estimate || 0);

                if (shift.status === 'draft') {
                    draftCount++;
                }

                const s = new Date(shift.start_time);
                const e = new Date(shift.end_time);
                const durationHours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
                totalHours += durationHours;
            });

            setData({
                branches: branches || [],
                settings: { weekStartDay: 1, workingHours: {} },
                stats: {
                    totalBudget,
                    actualCost: 0, // In future: Calc for 'completed' shifts only
                    totalHours
                },
                publishStatus: {
                    hasDrafts: draftCount > 0,
                    draftCount
                },
                loading: false,
                refresh: fetchSchedule // Pass self to allow manual re-fetch
            });

        } catch (error) {
            console.error("Error fetching schedule data:", error);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (academyId) fetchSchedule();
    }, [currentDate, academyId]);

    return { ...data, refresh: fetchSchedule };
}
