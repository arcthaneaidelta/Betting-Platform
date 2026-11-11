import React, { useMemo, useState } from 'react';
import { Check, X, Search, ArrowDownToLine } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
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

export const AdminDeposits: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [reviewReq, setReviewReq] = useState<DepositRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<DepositRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DepositRequest | null>(null);
  const [reason, setReason] = useState('');

  const admin = useAurelStore((s) => s.admin);
  const agents = useAurelStore((s) => s.agents);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const approveDepositRequest = useAurelStore((s) => s.approveDepositRequest);
  const rejectDepositRequest = useAurelStore((s) => s.rejectDepositRequest);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const filtered = useMemo(() => {
    const min = Number(minAmount) || 0;
    return depositRequests.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (agentFilter !== 'all' && d.agentId !== agentFilter) return false;
      if (min > 0 && d.amount < min) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${d.reference} ${d.customerName} ${d.agentName}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [depositRequests, statusFilter, agentFilter, minAmount, searchQuery]);

  const pageSize = 7;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <AdminLayout title="Global Deposit Management">
      <div className="space-y-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Platform Deposit Management
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Review, approve, or reject simulated internal deposit requests across all agents.
            Duplicate approvals are strictly guarded.
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference or user..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
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
            value={agentFilter}
            onChange={(val) => {
              setAgentFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Agents' },
              ...agents.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />

          <input
            type="number"
            value={minAmount}
            onChange={(e) => {
              setMinAmount(e.target.value);
              setPage(1);
            }}
            placeholder="Min amount ($)"
            className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm tabular-nums focus:border-forest focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ArrowDownToLine}
                title="No deposit requests match"
                description="Reset filters to view all simulated deposit requests."
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
                      <th className="px-4 py-3">Assigned Agent</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Request Date</th>
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
                        <td className="px-4 py-3.5 text-xs text-muted-grey">{req.agentName}</td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
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
                            onClick={() => setReviewReq(req)}
                            className="text-xs font-medium text-forest hover:underline mr-1"
                          >
                            Review
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
                                  setReason('');
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

      {/* Review Modal */}
      <Modal
        open={reviewReq !== null}
        onClose={() => setReviewReq(null)}
        title={reviewReq ? `Review Request · ${reviewReq.reference}` : ''}
        footer={
          reviewReq?.status === 'pending' ? (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  const t = reviewReq;
                  setReviewReq(null);
                  setRejectTarget(t);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const t = reviewReq;
                  setReviewReq(null);
                  setApproveTarget(t);
                }}
              >
                Approve Deposit
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setReviewReq(null)}>
              Close
            </Button>
          )
        }
      >
        {reviewReq && (
          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Customer</dt>
              <dd className="font-semibold">{reviewReq.customerName}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Assigned Agent</dt>
              <dd>{reviewReq.agentName}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Amount</dt>
              <dd className="font-semibold text-forest tabular-nums">
                {formatCurrency(reviewReq.amount, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Method</dt>
              <dd>{reviewReq.method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-grey">Status</dt>
              <dd>
                <Badge tone={statusToBadgeTone(reviewReq.status)}>{reviewReq.status}</Badge>
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmationDialog
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (!approveTarget) return;
          const res = approveDepositRequest(approveTarget.id, 'admin', admin.id);
          if (res.ok) addToast('success', 'Deposit Approved', res.message);
          else addToast('error', 'Approval Safeguard', res.message);
        }}
        title="Confirm Administrator Deposit Approval?"
        description="This immediately credits the customer's simulated balance, creates a ledger entry, records illustrative agent commission, and appends to the audit log."
        confirmLabel="Approve Deposit"
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
          const res = rejectDepositRequest(rejectTarget.id, 'admin', admin.id, reason);
          if (res.ok) addToast('info', 'Deposit Rejected', res.message);
          else addToast('error', 'Action Failed', res.message);
        }}
        title="Confirm Deposit Rejection?"
        description="Rejecting declines this request without crediting any simulated funds."
        confirmLabel="Reject Request"
        tone="danger"
      >
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason (optional)"
          className="h-10 w-full rounded-btn border border-warm-border px-3 text-xs focus:border-forest focus:outline-none"
        />
      </ConfirmationDialog>
    </AdminLayout>
  );
};

