'use client';

import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            'reader',
            { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                scanner.clear();
            },
            (error) => {
                // console.warn(error);
            }
        );

        return () => {
            scanner.clear().catch((error) => console.error('Failed to clear scanner', error));
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg bg-zinc-900 rounded-[40px] p-8 relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-black text-white mb-6 text-center">Quét mã vạch</h3>
                <div id="reader" className="overflow-hidden rounded-2xl bg-black border-2 border-indigo-500/30"></div>
                <p className="mt-6 text-zinc-500 text-center text-sm">
                    Đưa mã vạch sản phẩm vào khung hình để tự động nhận diện.
                </p>
            </div>
        </div>
    );
}
