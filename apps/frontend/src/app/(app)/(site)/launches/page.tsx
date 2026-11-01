export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@gitroom/frontend/components/launches/launches.component';
import { Metadata } from 'next';
import { brandNameServerSide } from '@gitroom/helpers/utils/brand.name.server.side';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: isGeneralServerSide()
    ? `${brandNameServerSide()} Calendar`
    : 'Gitroom Launches',
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
