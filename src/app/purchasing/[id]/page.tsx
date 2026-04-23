export async function generateStaticParams() {
  return [{ id: '0' }];
}

export const dynamic = 'force-static';
export const dynamicParams = false;

import PurchasingClient from './PurchasingClient';

export default function Page() {
  return <PurchasingClient />;
}
