export async function generateStaticParams() {
  return [{ id: '0' }];
}

export const dynamic = 'force-static';
export const dynamicParams = false;

import ReceivingClient from './ReceivingClient';

export default function Page() {
  return <ReceivingClient />;
}
