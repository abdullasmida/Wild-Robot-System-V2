import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Checks if the current user is allowed to access the system based on device limits.
 * Implements "Smart Displacement" (Newest Session Wins).
 */
export async function checkDeviceAccess(
    supabase: SupabaseClient,
    userId: string,
    isLoginAction: boolean = false
): Promise<{ allowed: boolean; reason?: string }> {
    try {
        // 1. IDENTIFY DEVICE (Fingerprint)
        let deviceId = localStorage.getItem('wibo_device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem('wibo_device_id', deviceId);
        }

        const uniqueSignature = `${navigator.userAgent}___DID:${deviceId}`;

        // 2. REGISTER HEARTBEAT (Newest Wins Upsert)
        // We just insert. The DB trigger 'trigger_smart_displacement' handles cleanup.
        const { error } = await supabase
            .from('active_sessions')
            .upsert({
                user_id: userId,
                device_id: deviceId,
                user_agent: uniqueSignature,
                last_active: new Date().toISOString()
            }, { onConflict: 'device_id' }); // Conflict on unique device_id

        if (error) {
            console.error("Session Register Error (Non-Critical):", error);
        }

        return { allowed: true, reason: 'Session Registered' };

    } catch (err) {
        console.error('Session Manager Error:', err);
        // Fail open to avoid blocking reliable users
        return { allowed: true, reason: 'Fail Open' };
    }
}
