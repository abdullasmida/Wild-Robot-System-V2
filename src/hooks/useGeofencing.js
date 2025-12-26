import { useState, useEffect } from 'react';

export default function useGeofencing(targetLat, targetLng, radiusMeters = 200) {
    const [location, setLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isWithinRange, setIsWithinRange] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const success = (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setLocation({ lat: currentLat, lng: currentLng });

            if (targetLat && targetLng) {
                const dist = calculateDistance(currentLat, currentLng, targetLat, targetLng);
                setDistance(dist);
                setIsWithinRange(dist <= radiusMeters);
            }
        };

        const handleError = (err) => {
            setError(err.message);
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        const id = navigator.geolocation.watchPosition(success, handleError, options);

        return () => navigator.geolocation.clearWatch(id);
    }, [targetLat, targetLng, radiusMeters]);

    return { location, distance, isWithinRange, error };
}

// Haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
