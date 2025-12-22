'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'orange' | 'indigo' | 'green' | 'yellow' | 'blue';
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'orange'
}: StatCardProps) {
    const colorClasses = {
        orange: 'from-orange-500/20 to-orange-600/20 text-orange-400',
        indigo: 'from-indigo-500/20 to-indigo-600/20 text-indigo-400',
        green: 'from-green-500/20 to-green-600/20 text-green-400',
        yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glass-card-hover p-6"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% dari kemarin
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    );
}
