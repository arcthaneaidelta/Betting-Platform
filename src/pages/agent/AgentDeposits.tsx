import React, { useMemo, useState } from 'react';
import { Check, X, Search, ArrowDownToLine } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { Modal, ConfirmationDialog } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { DepositRequest } from '@/types';

export const AgentDeposits: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [detailReq, setDetailReq] = useState<DepositRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<DepositRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DepositRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const approveDepositRequest = useAurelStore((s) => s.approveDepositRequest);
  const rejectDepositRequest = useAurelStore((s) => s.rejectDepositRequest);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  // Scoped strictly to assigned customers
  const filtered = useMemo(() => {
    const now = Date.now();
    return depositRequests.filter((d) => {
      if (d.agentId !== activeAgentId) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (dateFilter !== 'all') {
        const diff = (now - new Date(d.submittedAt).getTime()) / 86400000;
        if (dateFilter === '7d' && diff > 7) return false;
        if (dateFilter === '30d' && diff > 30) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${d.reference} ${d.customerName} ${d.method}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [depositRequests, activeAgentId, statusFilter, dateFilter, searchQuery]);

  const pageSize = 6;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <AgentLayout title="Deposit Requests">
      <div className="space-y-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Assigned Deposit Review Queue
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Approve or reject internal deposit requests submitted by your assigned customers.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference or customer..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />

          <CustomSelect
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>

        {/* Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ArrowDownToLine}
                title="No deposit requests found"
                description="No assigned customer deposit requests match your selected filter."
                actionLabel="Reset filters"
                onAction={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((req) => (
                      <tr key={req.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={req.reference} />
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-charcoal">
                          {req.customerName}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-charcoal tabular-nums">
                          {formatCurrency(req.amount, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey">{req.method}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatDateTime(req.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={statusToBadgeTone(req.status)}>{req.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailReq(req)}
                            className="text-xs font-medium text-forest hover:underline mr-1"
                          >
                            View
                          </button>
                          {req.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setApproveTarget(req)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setRejectionReason('');
                                  setRejectTarget(req);
                                }}
                              >
                                <X className="h-3.5 w-3.5 text-error" />
                                Reject
                              </Button>
                            </>
                          )}
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

      {/* Details Modal */}
      <Modal
        open={detailReq !== null}
        onClose={() => setDetailReq(null)}
        title={detailReq ? `Request ${detailReq.reference}` : ''}
        footer={
          <Button variant="primary" onClick={() => setDetailReq(null)}>
            Close
          </Button>
        }
      >
        {detailReq && (
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Customer</dt>
              <dd className="font-semibold text-charcoal">{detailReq.customerName}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Requested Demo Amount</dt>
              <dd className="font-semibold text-forest tabular-nums">
                {formatCurrency(detailReq.amount, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Method</dt>
              <dd>{detailReq.method}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Status</dt>
              <dd>
                <Badge tone={statusToBadgeTone(detailReq.status)}>{detailReq.status}</Badge>
              </dd>
            </div>
            {detailReq.note && (
              <div>
                <dt className="text-muted-grey mb-1">Note</dt>
                <dd className="rounded-btn bg-ivory p-2.5 text-charcoal">{detailReq.note}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>

      <ConfirmationDialog
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (!approveTarget) return;
          const res = approveDepositRequest(approveTarget.id, 'agent', activeAgentId);
          if (res.ok) {
            addToast('success', 'Request Approved', res.message);
          } else {
            addToast('error', 'Approval Safeguard', res.message);
          }
        }}
        title="Approve Simulated Deposit Request?"
        description="Approving credits the customer's simulated wallet, records a transaction ledger entry, and logs an illustrative commission."
        confirmLabel="Confirm Approval"
        details={
          approveTarget
            ? [
                { label: 'Reference', value: approveTarget.reference },
                { label: 'Customer', value: approveTarget.customerName },
                { label: 'Amount', value: formatCurrency(approveTarget.amount, currency) },
              ]
            : undefined
        }
      />

      <ConfirmationDialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => {
          if (!rejectTarget) return;
          const res = rejectDepositRequest(
            rejectTarget.id,
            'agent',
            activeAgentId,
            rejectionReason
          );
          if (res.ok) {
            addToast('info', 'Request Rejected', res.message);
          } else {
            addToast('error', 'Action Failed', res.message);
          }
        }}
        title="Reject Simulated Deposit Request?"
        description="Rejecting marks this request as declined without crediting the customer's demo balance."
        confirmLabel="Confirm Rejection"
        tone="danger"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-charcoal">
            Reason (Optional)
          </label>
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Duplicate demo submission"
            className="h-10 w-full rounded-btn border border-warm-border px-3 text-xs focus:border-forest focus:outline-none"
          />
        </div>
      </ConfirmationDialog>
    </AgentLayout>
  );
};

