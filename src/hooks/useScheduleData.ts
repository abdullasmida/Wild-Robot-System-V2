import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface ScheduleData {
    branches: { id: string; name: string }[];
    shifts: any[];
    coaches: any[];
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
        shifts: [],
        coaches: [],
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

            // 2. Fetch Shifts (Visible Week)
            const { data: shifts, error: shiftError } = await supabase
                .from('staff_shifts')
                .select(`
                    id, 
                    cost_estimate, 
                    start_time, 
                    end_time, 
                    location_id,
                    staff_id,
                    status,
                    staff:profiles!staff_id ( id, first_name, last_name, avatar_url, role )
                `)
                .eq('academy_id', academyId)
                .gte('start_time', start)
                .lte('start_time', end);

            if (shiftError) console.error("Shift Fetch Error:", shiftError);

            // 3. Fetch Coaches (Source of Truth: Profiles)
            // We fetch ALL staff profiles to ensure the sidebar is populated correctly
            const { data: rawCoaches } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, role, avatar_url')
                .eq('academy_id', academyId)
                .in('role', ['coach', 'head_coach', 'manager', 'admin']);

            // Map to the format expected by the UI (combining names)
            const coaches = (rawCoaches as any[] || []).map(p => ({
                id: p.id,
                first_name: p.first_name,
                last_name: p.last_name,
                full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
                role: p.role,
                avatar_url: p.avatar_url,
                // Legacy fields (optional, can be null safe)
                specialization: '',
                job_title: p.role
            }));

            // 4. Calculate Stats
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
                shifts: shifts || [],
                coaches: coaches || [], // Now robust
                settings: { weekStartDay: 1, workingHours: {} },
                stats: {
                    totalBudget,
                    actualCost: 0,
                    totalHours
                },
                publishStatus: {
                    hasDrafts: draftCount > 0,
                    draftCount
                },
                loading: false,
                refresh: fetchSchedule
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
