export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            academies: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    subscription_plan: string
                    owner_id: string
                    logo_url: string | null
                    brand_color: string | null
                    theme_settings: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    subscription_plan?: string
                    owner_id: string
                    logo_url?: string | null
                    theme_settings?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    subscription_plan?: string
                    owner_id?: string
                    logo_url?: string | null
                    theme_settings?: Json | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    email: string
                    first_name: string | null
                    last_name: string | null
                    avatar_url: string | null
                    academy_id: string | null
                    role: 'owner' | 'admin' | 'coach' | 'athlete' | 'parent'
                    phone: string | null
                    setup_completed: boolean
                    onboarding_step: number | null
                }
                Insert: {
                    id: string
                    created_at?: string
                    email: string
                    full_name: string
                    avatar_url?: string | null
                    academy_id?: string | null
                    role: 'owner' | 'admin' | 'coach' | 'athlete' | 'parent'
                    phone?: string | null
                    onboarding_completed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    full_name?: string
                    avatar_url?: string | null
                    academy_id?: string | null
                    role?: 'owner' | 'admin' | 'coach' | 'athlete' | 'parent'
                    phone?: string | null
                    onboarding_completed?: boolean
                }
            }
            batches: {
                Row: {
                    id: string
                    created_at: string
                    academy_id: string
                    name: string
                    level_id: string | null
                    coach_id: string | null
                    location_id: string | null
                    schedule: Json
                    max_students: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    academy_id: string
                    name: string
                    level_id?: string | null
                    coach_id?: string | null
                    location_id?: string | null
                    schedule?: Json
                    max_students?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    academy_id?: string
                    name?: string
                    level_id?: string | null
                    coach_id?: string | null
                    location_id?: string | null
                    schedule?: Json
                    max_students?: number
                }
            }
            sessions: {
                Row: {
                    id: string
                    created_at: string
                    batch_id: string
                    date: string
                    start_time: string
                    end_time: string
                    status: 'scheduled' | 'completed' | 'cancelled'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    batch_id: string
                    date: string
                    start_time: string
                    end_time: string
                    status?: 'scheduled' | 'completed' | 'cancelled'
                }
                Update: {
                    id?: string
                    created_at?: string
                    batch_id?: string
                    date?: string
                    start_time?: string
                    end_time?: string
                    status?: 'scheduled' | 'completed' | 'cancelled'
                }
            }
            // Add other tables (staff_tasks, timesheets, xp_ledger, wibo_coins_ledger, skills, player_evaluations) as needed with basic types
        }
    }
