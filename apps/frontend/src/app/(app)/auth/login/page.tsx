export const dynamic = 'force-dynamic';
import { Login } from '@gitroom/frontend/components/auth/login';
import { Metadata } from 'next';
import { brandNameServerSide } from '@gitroom/helpers/utils/brand.name.server.side';
export const metadata: Metadata = {
  title: `${brandNameServerSide()} Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
