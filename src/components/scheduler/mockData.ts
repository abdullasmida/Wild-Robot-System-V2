import { startOfWeek, addDays, setHours, addMinutes, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface Profile {
    id: string;
    full_name: string;
    first_name?: string; // Real DB field
    last_name?: string; // Real DB field
    email?: string;
    avatar_url?: string;
    avatar_color?: string; // New field
    role: string;
    // New fields
    employmentType?: 'full_time' | 'part_time';
    dailyHoursLimit?: number;
    hourlyRate?: number; // Legacy match
    hourly_rate?: number; // Real DB match
    academy_id?: string;
}

export interface Batch {
    id: string;
    name: string;
    level_name: string; // Joined from levels
    sport_name: string; // Joined from sports
    color: string; // For visual distinction
}

export interface Location {
    id: string;
    name: string;
    capacity: number;
}

export interface Session {
    id: string;
    batch_id: string;
    coach_id: string | null;
    location_id: string;
    start_time: string; // ISO string
    end_time: string; // ISO string
    status: 'scheduled' | 'completed' | 'cancelled';
    wibo_conflict_flag: boolean;

    // Joined Data
    batch: Batch;
    coach?: Profile | null;
    location?: Location;
}

// Generate Mock Data
const TODAY = new Date();
const START_OF_WEEK = startOfWeek(TODAY, { weekStartsOn: 1 }); // Monday

export const LOCATIONS: Location[] = [
    { id: 'loc-1', name: 'Main Gym Hall', capacity: 30 },
    { id: 'loc-2', name: 'Trampoline Zone', capacity: 15 },
    { id: 'loc-3', name: 'Dance Studio', capacity: 20 },
    { id: 'loc-4', name: 'Outdoor Field', capacity: 50 },
];

export const COACHES: Profile[] = [
    {
        id: 'coach-1',
        full_name: 'Coach Sarah',
        avatar_url: 'https://i.pravatar.cc/150?u=sarah',
        role: 'Head Coach',
        employmentType: 'full_time',
        salary: 12000,
        dailyHoursLimit: 8
    },
    {
        id: 'coach-2',
        full_name: 'Coach Mike',
        avatar_url: 'https://i.pravatar.cc/150?u=mike',
        role: 'Coach',
        employmentType: 'part_time',
        hourlyRate: 150
    },
    {
        id: 'coach-3',
        full_name: 'Coach Alex',
        avatar_url: 'https://i.pravatar.cc/150?u=alex',
        role: 'Assistant',
        employmentType: 'part_time',
        hourlyRate: 100
    },
];

const BATCHES: Batch[] = [
    { id: 'batch-1', name: 'Elite Gymnastics', level_name: 'Level 5', sport_name: 'Gymnastics', color: 'bg-emerald-500' },
    { id: 'batch-2', name: 'Toddler Tumble', level_name: 'Beginner', sport_name: 'Gymnastics', color: 'bg-blue-500' },
    { id: 'batch-3', name: 'Teen Parkour', level_name: 'Intermediate', sport_name: 'Parkour', color: 'bg-amber-500' },
];

export const fetchWeekSessions = async (): Promise<Session[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const sessions: Session[] = [
        {
            id: 'sess-1',
            batch_id: 'batch-1',
            coach_id: 'coach-1',
            location_id: 'loc-1',
            start_time: setHours(TODAY, 16).toISOString(),
            end_time: setHours(TODAY, 18).toISOString(),
            status: 'scheduled',
            wibo_conflict_flag: false,
            batch: BATCHES[0],
            coach: COACHES[0],
        },
        {
            id: 'sess-2',
            batch_id: 'batch-2',
            coach_id: null, // Unassigned
            location_id: 'loc-2',
            start_time: setHours(TODAY, 17).toISOString(),
            end_time: setHours(TODAY, 18).toISOString(),
            status: 'scheduled',
            wibo_conflict_flag: true, // Conflict!
            batch: BATCHES[1],
            coach: null,
        },
        {
            id: 'sess-3',
            batch_id: 'batch-3',
            coach_id: 'coach-2',
            location_id: 'loc-1',
            start_time: setHours(addDays(TODAY, 1), 15).toISOString(),
            end_time: setHours(addDays(TODAY, 1), 16).addMinutes(30).toISOString(),
            status: 'scheduled',
            wibo_conflict_flag: false,
            batch: BATCHES[2],
            coach: COACHES[1],
        },
        // Add more for "Dot Logic" testing (multiple on same day)
        {
            id: 'sess-4',
            batch_id: 'batch-1',
            coach_id: 'coach-1',
            location_id: 'loc-1',
            start_time: setHours(TODAY, 10).toISOString(),
            end_time: setHours(TODAY, 11).toISOString(),
            status: 'scheduled',
            wibo_conflict_flag: false,
            batch: BATCHES[0],
            coach: COACHES[0],
        },
        {
            id: 'sess-5',
            batch_id: 'batch-2',
            coach_id: 'coach-2',
            location_id: 'loc-3',
            start_time: setHours(TODAY, 12).toISOString(),
            end_time: setHours(TODAY, 13).toISOString(),
            status: 'scheduled',
            wibo_conflict_flag: false,
            batch: BATCHES[1],
            coach: COACHES[1],
        },
    ];

    return sessions;
};
