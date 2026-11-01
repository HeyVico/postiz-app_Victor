export const dynamic = 'force-dynamic';
import { AdminWorkspacesComponent } from '@gitroom/frontend/components/admin/admin-workspaces.component';
import { Metadata } from 'next';
import { brandNameServerSide } from '@gitroom/helpers/utils/brand.name.server.side';

export const metadata: Metadata = {
  title: `${brandNameServerSide()} Admin Workspaces`,
  description: '',
};

export default async function Page() {
  return (
    <div className="bg-newBgColorInner flex-1 flex-col flex p-[20px] gap-[12px]">
      <AdminWorkspacesComponent />
    </div>
  );
}
