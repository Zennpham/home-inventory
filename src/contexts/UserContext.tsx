'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
    isLoading: true
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserContextType>({
        role: 'guest',
        name: 'Khách',
        permissions: defaultPermissions,
        token: null,
        isLoading: true
    });

    useEffect(() => {
        // Check for token in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const storedToken = localStorage.getItem('familyToken');
        const token = urlToken || storedToken;

        // If token from URL, save it to localStorage for future visits
        if (urlToken && urlToken !== storedToken) {
            localStorage.setItem('familyToken', urlToken);
        }

        // Check if running on localhost (Admin mode)
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (isLocalhost && !token) {
            // Localhost without token = Admin
            setUser({
                role: 'admin',
                name: 'Admin (Ngân)',
                permissions: {
                    canAddItems: true,
                    canEditItems: true,
                    canDeleteItems: true,
                    canManageLocations: true
                },
                token: null,
                isLoading: false
            });
            return;
        }

        if (token) {
            // Validate token with API
            fetch(`/api/auth/me?token=${token}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        setUser(prev => ({ ...prev, isLoading: false }));
                    } else {
                        setUser({
                            role: data.role,
                            name: data.name,
                            permissions: data.permissions,
                            token,
                            isLoading: false
                        });
                    }
                })
                .catch(() => {
                    setUser(prev => ({ ...prev, isLoading: false }));
                });
        } else {
            // No token, not localhost = Guest
            setUser(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

// Helper hook for permission checks
export function usePermission(permission: keyof UserPermissions): boolean {
    const { permissions, role } = useUser();
    if (role === 'admin') return true; // Admin has all permissions
    return permissions[permission];
}
