import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    circle?: boolean;
}

export default function Skeleton({ className = '', circle = false }: SkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
                ease: "easeInOut"
            }}
            className={`bg-zinc-200 dark:bg-zinc-800 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
        />
    );
}
