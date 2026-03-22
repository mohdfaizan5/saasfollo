export type PolarCheckoutStatus =
  | 'open'
  | 'expired'
  | 'confirmed'
  | 'succeeded'
  | 'failed';

export interface PolarCheckoutSession {
  id: string;
  status: PolarCheckoutStatus;
  success_url: string;
  return_url: string | null;
  customer_email?: string | null;
  product?: {
    id?: string;
    name?: string;
  } | null;
}

export async function getPolarCheckoutSession(checkoutId: string) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Polar checkout (${response.status})`);
  }

  return (await response.json()) as PolarCheckoutSession;
}
