'use client';

import React, { FC, useCallback, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { Button } from '@gitroom/react/form/button';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  member: boolean;
  members: number;
  channels: number;
  allowedProviders: string[] | null;
}

interface Provider {
  identifier: string;
  name: string;
}

const useWorkspaces = (search: string) => {
  const fetch = useFetch();
  const query = new URLSearchParams(search ? { search } : {});
  return useSWR<Workspace[]>(
    `/admin/organizations?${query.toString()}`,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load workspaces');
      }
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

const useProviders = () => {
  const fetch = useFetch();
  return useSWR<Provider[]>(
    'admin-workspaces-providers',
    async () => (await (await fetch('/integrations')).json()).social,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

const AllowedProvidersModal: FC<{
  workspace: Workspace;
  close: () => void;
  onSaved: () => void;
}> = ({ workspace, close, onSaved }) => {
  const fetch = useFetch();
  const toast = useToaster();
  const { data: providers, isLoading } = useProviders();
  const [allowAll, setAllowAll] = useState(!workspace.allowedProviders);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(workspace.allowedProviders || [])
  );
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((identifier: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await fetch(`/admin/organizations/${workspace.id}/providers`, {
      method: 'PUT',
      body: JSON.stringify({
        providers: allowAll ? null : Array.from(selected),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      toast.show('Could not save the allowed channels', 'warning');
      return;
    }

    toast.show('Allowed channels saved');
    onSaved();
    close();
  }, [allowAll, selected, workspace.id]);

  return (
    <div className="flex flex-col gap-[16px] text-textColor">
      <label className="flex items-center gap-[8px] text-[14px] cursor-pointer">
        <input
          type="checkbox"
          checked={allowAll}
          onChange={(e) => setAllowAll(e.target.checked)}
        />
        Allow every channel
      </label>
      {!allowAll &&
        (isLoading ? (
          <LoadingComponent />
        ) : (
          <div className="grid grid-cols-3 mobile:grid-cols-2 gap-[8px]">
            {(providers || []).map((provider) => (
              <label
                key={provider.identifier}
                className="flex items-center gap-[8px] text-[13px] cursor-pointer border border-newTableBorder rounded-[8px] px-[10px] py-[8px] bg-newBgColorInner"
              >
                <input
                  type="checkbox"
                  checked={selected.has(provider.identifier)}
                  onChange={() => toggle(provider.identifier)}
                />
                <img
                  src={`/icons/platforms/${provider.identifier}.png`}
                  className="w-[20px] h-[20px] rounded-full"
                  alt={provider.name}
                />
                <span className="truncate">{provider.name}</span>
              </label>
            ))}
          </div>
        ))}
      {!allowAll && selected.size === 0 && (
        <div className="text-[13px] text-red-400">
          No channel selected: this workspace will not be able to connect any
          channel.
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>
          Save
        </Button>
      </div>
    </div>
  );
};

export const AdminWorkspacesComponent: FC = () => {
  const user = useUser();
  const fetch = useFetch();
  const toast = useToaster();
  const modals = useModals();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error, mutate } = useWorkspaces(search);

  const create = useCallback(async () => {
    setCreating(true);
    const res = await fetch('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    setCreating(false);

    if (!res.ok) {
      const { message } = await res.json().catch(() => ({} as any));
      toast.show(
        (Array.isArray(message) ? message[0] : message) ||
          'Could not create the workspace',
        'warning'
      );
      return;
    }

    toast.show('Workspace created');
    setName('');
    mutate();
  }, [name]);

  const openWorkspace = useCallback(
    (workspace: Workspace) => async () => {
      await fetch('/user/change-org', {
        method: 'POST',
        body: JSON.stringify({
          id: workspace.id,
        }),
      });
      window.location.href = '/launches';
    },
    []
  );

  const editProviders = useCallback(
    (workspace: Workspace) => () => {
      modals.openModal({
        title: `Allowed channels - ${workspace.name}`,
        children: (close: () => void) => (
          <AllowedProvidersModal
            workspace={workspace}
            close={close}
            onSaved={() => mutate()}
          />
        ),
      });
    },
    [mutate]
  );

  if (!user?.isSuperAdmin) {
    return (
      <div className="text-textColor p-[20px]">
        You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px] text-textColor">
      <div className="flex flex-col gap-[4px]">
        <div className="text-[20px] font-[600]">Workspaces</div>
        <div className="text-[13px] opacity-70">
          Create a workspace for each client, open it and invite its people from
          Settings → Team.
        </div>
      </div>

      <div className="flex flex-wrap gap-[12px] items-end bg-newBgColorInner border border-newTableBorder rounded-[8px] p-[12px]">
        <div className="flex flex-col gap-[6px] flex-1 min-w-[220px]">
          <div className="text-[12px] opacity-70">New workspace name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            className="bg-newBgColorInner h-[38px] border border-newTableBorder rounded-[8px] px-[10px] text-[14px] text-textColor"
          />
        </div>
        <Button
          onClick={create}
          loading={creating}
          disabled={name.trim().length < 3}
        >
          Create workspace
        </Button>
      </div>

      <div className="flex flex-wrap gap-[12px] items-end">
        <div className="flex flex-col gap-[6px] flex-1 min-w-[220px]">
          <div className="text-[12px] opacity-70">Search</div>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput.trim());
              }
            }}
            placeholder="Workspace name"
            className="bg-newBgColorInner h-[38px] border border-newTableBorder rounded-[8px] px-[10px] text-[14px] text-textColor"
          />
        </div>
        <Button onClick={() => setSearch(searchInput.trim())}>Search</Button>
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : error || !data ? (
        <div className="text-red-400">Failed to load workspaces.</div>
      ) : (
        <div className="border border-newTableBorder rounded-[8px] overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1fr_90px_90px_140px_220px] gap-[12px] px-[12px] py-[10px] bg-newBgColorInner text-[12px] uppercase opacity-70 border-b border-newTableBorder">
              <div>Name</div>
              <div className="text-right">Members</div>
              <div className="text-right">Channels</div>
              <div>Allowed channels</div>
              <div />
            </div>
            {data.length === 0 ? (
              <div className="px-[12px] py-[10px] text-[13px] opacity-70">
                No workspaces found.
              </div>
            ) : (
              data.map((workspace) => (
                <div
                  key={workspace.id}
                  className="grid grid-cols-[1fr_90px_90px_140px_220px] gap-[12px] px-[12px] py-[10px] text-[13px] items-center border-b border-newTableBorder last:border-b-0"
                >
                  <div className="flex flex-col">
                    <div className="truncate">{workspace.name}</div>
                    <div className="text-[11px] opacity-50">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">{workspace.members}</div>
                  <div className="text-right">{workspace.channels}</div>
                  <div>
                    {workspace.allowedProviders
                      ? `${workspace.allowedProviders.length} selected`
                      : 'All'}
                  </div>
                  <div className="flex gap-[8px] justify-end">
                    <Button secondary={true} onClick={editProviders(workspace)}>
                      Channels
                    </Button>
                    {workspace.member && (
                      <Button onClick={openWorkspace(workspace)}>Open</Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
