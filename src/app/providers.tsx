'use client';

import { UserProvider } from '@/contexts/UserContext';
import AuthGuard from '@/components/AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthGuard>
                {children}
            </AuthGuard>
        </UserProvider>
    );
}
