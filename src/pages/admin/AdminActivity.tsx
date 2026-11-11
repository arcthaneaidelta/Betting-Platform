import React, { useMemo, useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Badge } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatDateTime } from '@/utils/formatters';

export const AdminActivity: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const activityLogs = useAurelStore((s) => s.activityLogs);

  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !`${log.id} ${log.actorName} ${log.action} ${log.description}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [activityLogs, moduleFilter, searchQuery]);

  const pageSize = 8;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <AdminLayout title="Audit Activity Logs">
      <div className="space-y-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Platform Audit Activity Logs
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Chronological trace of every major simulated user, agent, and administrator action.
          </p>
        </div>

        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search actor, action, description..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <CustomSelect
            value={moduleFilter}
            onChange={(val) => {
              setModuleFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Modules' },
              { value: 'Customers', label: 'Customers' },
              { value: 'Agents', label: 'Agents' },
              { value: 'Deposits', label: 'Deposits' },
              { value: 'Wallets', label: 'Wallets' },
              { value: 'Betting', label: 'Betting' },
              { value: 'Sports', label: 'Sports' },
              { value: 'Commissions', label: 'Commissions' },
              { value: 'Settings', label: 'Settings' },
            ]}
          />
        </div>

        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardList}
                title="No activity logs found"
                description="Clear filters to inspect the complete audit log."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Activity ID</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((log) => (
                      <tr key={log.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={log.id} />
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-medium text-charcoal">{log.actorName}</p>
                          <p className="text-[10px] uppercase text-muted-grey">{log.actorRole}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-forest">
                          {log.action}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone="neutral">{log.module}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey max-w-md">
                          {log.description}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatDateTime(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

