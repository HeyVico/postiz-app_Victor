import { Metadata } from 'next';
import { brandNameServerSide } from '@gitroom/helpers/utils/brand.name.server.side';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: `${brandNameServerSide()} - Agent`,
  description: '',
};

export default async function Page() {
  return redirect('/agents/new');
}
