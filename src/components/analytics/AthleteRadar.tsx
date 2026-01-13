import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const AthleteRadar = ({ stats }) => {
    // Data comes from your DB query on missed_training_logs vs total sessions
    const data = [
        { subject: 'Vault', A: stats.vaultScore, fullMark: 100 },
        { subject: 'Bars', A: stats.barsScore, fullMark: 100 },
        { subject: 'Beam', A: stats.beamScore, fullMark: 100 },
        { subject: 'Floor', A: stats.floorScore, fullMark: 100 },
        { subject: 'Fitness', A: stats.fitnessScore, fullMark: 100 },
    ];

    return (
        <div className="h-64 w-full bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-2">Training Balance</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skill Balance"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AthleteRadar;