export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@gitroom/frontend/components/platform-analytics/platform.analytics';
import { brandNameServerSide } from '@gitroom/helpers/utils/brand.name.server.side';
export const metadata: Metadata = {
  title: `${brandNameServerSide()} Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
