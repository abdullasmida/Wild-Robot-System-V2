import React, { useState } from 'react';

export default function ChaosMonkey() {
    const [isActive, setIsActive] = useState(false);

    // Only show in Development mode
    if (import.meta.env.MODE !== 'development') {
        return null;
    }

    const releaseGremlins = async () => {
        setIsActive(true);
        try {
            // Dynamically load gremlins.js if not present
            if (!window.gremlins) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://unpkg.com/gremlins.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // Unleash the horde!
            if (window.gremlins) {
                const horde = window.gremlins.createHorde({
                    species: [
                        window.gremlins.species.clicker(),
                        window.gremlins.species.toucher(),
                        window.gremlins.species.formFiller(),
                        window.gremlins.species.scroller()
                    ],
                    mogwais: [
                        window.gremlins.mogwais.alert(), // prevents alert popups blocking test
                        window.gremlins.mogwais.fps()
                    ],
                    strategies: [
                        window.gremlins.strategies.distribution({
                            delay: 10, // fast clicks
                            nb: 1000 // 1000 actions
                        })
                    ]
                });

                console.log('🧟‍♂️ Gremlins released! Good luck.');
                horde.unleash();

                // Cleanup flag after rough duration
                setTimeout(() => setIsActive(false), 10000);
            }
        } catch (error) {
            console.error("Failed to load gremlins:", error);
            setIsActive(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-4 z-[9999]">
            <button
                onClick={releaseGremlins}
                disabled={isActive}
                className={`bg-red-600 hover:bg-red-700 text-white font-mono text-xs px-3 py-2 rounded-lg shadow-lg border-2 border-red-800 transition-transform active:scale-95 flex items-center gap-2 ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Only visible in Dev Mode"
            >
                <span className="text-lg">🧟‍♂️</span>
                {isActive ? 'ATTACKING...' : 'CHAOS TEST'}
            </button>
        </div>
    );
}
