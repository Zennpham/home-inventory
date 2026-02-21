import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Home Inventory Pro',
        short_name: 'HomeInv',
        description: 'Hệ thống quản lý kho gia đình thông minh kết nối NFC',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#18181b',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
