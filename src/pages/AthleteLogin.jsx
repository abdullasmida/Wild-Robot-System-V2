// داخل دالة handleLogin
const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. محاولة الدخول
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // 2. 🛑 نقطة التفتيش: مين ده؟
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // 3. طرد المتطفلين
        if (profile?.role !== 'athlete') {
            await supabase.auth.signOut(); // اطرده فوراً
            throw new Error("⛔ Access Denied: This portal is for Athletes only. Coaches please use the Staff Access.");
        }

        // 4. لو رياضي بجد -> اتفضل
        navigate('/athlete');

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};