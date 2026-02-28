import React from 'react'
import Image from 'next/image'

export const metadata = {
    title: 'Copywriting | Resources | SaaSFollo',
};

const page = () => {
    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Image src="/qr.png" alt="QR Code" width={400} height={400} priority />
        </div>
    )
}

export default page