import ApprovalClient from './ApprovalClient';

export async function generateStaticParams() {
  return [{ id: '0' }];
}

export default function Page() {
  return <ApprovalClient />;
}
