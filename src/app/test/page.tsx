'use client'

import { Button } from '@/components/ui/button'
import posthog from 'posthog-js'
import { usePostHog } from 'posthog-js/react'

export default function CheckoutPage() {
    const posthog = usePostHog()

    async function handlePurchase() {
        const result = await posthog.capture('purchase_completed', { amount: 99 })
        alert('Purchase completed! Event sent to PostHog.')
        console.log('PostHog capture result:', result)
    }

    return <Button onClick={handlePurchase}>Complete purchase2</Button>
}