'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface UserPermissions {
    canAddItems: boolean;
    canEditItems: boolean;
    canDeleteItems: boolean;
    canManageLocations: boolean;
}

interface UserContextType {
    role: 'admin' | 'family' | 'guest';
    name: string;
    permissions: UserPermissions;
    token: string | null;
    isLoading: boolean;
    login: (pin: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const defaultPermissions: UserPermissions = {
    canAddItems: false,
    canEditItems: false,
    canDeleteItems: false,
    canManageLocations: false
};

const UserContext = createContext<UserContextType>({
    role: 'guest',
    name: 'Khách',
    permissions: defaultPermissions,
    token: null,
    isLoading: true,
    login: async () => ({ success: false }),
    logout: () => { }
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<'admin' | 'family' | 'guest'>('guest');
    const [name, setName] = useState('Khách');
    const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applySession = useCallback((data: any) => {
        setRole(data.role);
        setName(data.name);
        setPermissions(data.permissions);
        setToken(data.token || null);
    }, []);

    useEffect(() => {
        // Check if running on localhost (Auto Admin)
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            setRole('admin');
            setName('Hngan (Local)');
            setPermissions({ canAddItems: true, canEditItems: true, canDeleteItems: true, canManageLocations: true });
            setIsLoading(false);
            return;
        }

        // Check URL token first (from share links)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');

        // Then localStorage
        const stored = localStorage.getItem('homeInv_session');
        const savedSession = stored ? JSON.parse(stored) : null;
        const tokenToUse = urlToken || savedSession?.token;

        if (tokenToUse) {
            fetch(`/api/auth/me?token=${tokenToUse}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        applySession({ ...data, token: tokenToUse });
                        if (urlToken) {
                            localStorage.setItem('homeInv_session', JSON.stringify({ token: urlToken, ...data }));
                        }
                    }
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [applySession]);

    const login = useCallback(async (pin: string, name?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, name })
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error || 'PIN sai' };

            applySession(data);
            localStorage.setItem('homeInv_session', JSON.stringify(data));
            return { success: true };
        } catch {
            return { success: false, error: 'Lỗi kết nối' };
        }
    }, [applySession]);

    const logout = useCallback(() => {
        localStorage.removeItem('homeInv_session');
        setRole('guest');
        setName('Khách');
        setPermissions(defaultPermissions);
        setToken(null);
    }, []);

    return (
        <UserContext.Provider value={{ role, name, permissions, token, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

export function usePermission(permission: keyof UserPermissions): boolean {
    const { permissions, role } = useUser();
    if (role === 'admin') return true;
    return permissions[permission];
}
