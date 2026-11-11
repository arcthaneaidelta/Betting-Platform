import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  Wallet,
  Plus,
  XCircle,
} from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { Modal, ConfirmationDialog } from '@/components/common/Modal';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, generateReference } from '@/utils/formatters';
import { DepositMethod, DepositRequest } from '@/types';

const depositSchema = z.object({
  amount: z.coerce
    .number()
    .min(10, 'Minimum simulated deposit is $10')
    .max(25000, 'Maximum single demo request is $25,000'),
  method: z.enum([
    'Agent-assisted deposit',
    'Internal account credit',
    'Manual deposit request',
  ]),
  reference: z.string().min(4, 'Reference is required'),
  note: z.string().max(180).optional(),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export const CustomerDeposits: React.FC = () => {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detailReq, setDetailReq] = useState<DepositRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<DepositRequest | null>(null);

  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const submitDepositRequest = useAurelStore((s) => s.submitDepositRequest);
  const cancelDepositRequest = useAurelStore((s) => s.cancelDepositRequest);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  const myRequests = useMemo(
    () => depositRequests.filter((r) => r.customerId === customer.id),
    [depositRequests, customer.id]
  );

  const pendingCount = myRequests.filter((r) => r.status === 'pending').length;
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');
  const totalApprovedAmount = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  const filtered = useMemo(() => {
    const now = Date.now();
    return myRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (dateFilter !== 'all') {
        const diffDays = (now - new Date(r.submittedAt).getTime()) / 86400000;
        if (dateFilter === '7d' && diffDays > 7) return false;
        if (dateFilter === '30d' && diffDays > 30) return false;
      }
      return true;
    });
  }, [myRequests, statusFilter, dateFilter]);

  const pageSize = 5;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 500,
      method: 'Agent-assisted deposit',
      reference: generateReference('REQ'),
      note: '',
    },
  });

  const selectedMethod = watch('method');

  const openNewModal = () => {
    reset({
      amount: 500,
      method: 'Agent-assisted deposit',
      reference: generateReference('REQ'),
      note: '',
    });
    setNewModalOpen(true);
  };

  const onSubmit = (values: DepositFormValues) => {
    const res = submitDepositRequest({
      customerId: customer.id,
      amount: values.amount,
      method: values.method,
      reference: values.reference,
      note: values.note,
    });
    if (res.ok) {
      addToast('success', 'Deposit Request Submitted', res.message);
      setNewModalOpen(false);
    } else {
      addToast('error', 'Unable to submit request', res.message);
    }
  };

  return (
    <CustomerLayout title="Internal Deposit Requests">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Internal Demo Deposit Requests
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Request simulated credits reviewed by your assigned agent or administrator. No real
              payment gateways are involved.
            </p>
          </div>
          <Button variant="primary" onClick={openNewModal}>
            <Plus className="h-4 w-4" />
            New Deposit Request
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Available Demo Balance"
            value={formatCurrency(customer.walletBalance, currency)}
            icon={Wallet}
            accent
          />
          <StatCard
            label="Pending Requests"
            value={String(pendingCount)}
            sublabel="Awaiting agent/admin review"
            icon={Clock}
          />
          <StatCard
            label="Approved Requests"
            value={String(approvedRequests.length)}
            sublabel="Credited to demo wallet"
            icon={CheckCircle2}
          />
          <StatCard
            label="Total Demo Deposits"
            value={formatCurrency(totalApprovedAmount, currency)}
            sublabel="Cumulative approved demo credits"
            icon={ArrowDownToLine}
          />
        </div>

        {/* Filters */}
        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2">
          <CustomSelect
            label="Filter by Status"
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
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <CustomSelect
            label="Date Range"
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>

        {/* Request History */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ArrowDownToLine}
                title="No deposit requests found"
                description="Submit a simulated internal deposit request to test the agent & admin approval workflow."
                actionLabel="New Deposit Request"
                onAction={openNewModal}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Demo Method</th>
                      <th className="px-4 py-3">Assigned Agent</th>
                      <th className="px-4 py-3 text-right">Amount</th>
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
                          {req.method}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey">{req.agentName}</td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-charcoal tabular-nums">
                          {formatCurrency(req.amount, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatDateTime(req.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={statusToBadgeTone(req.status)}>{req.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDetailReq(req)}
                            className="text-xs font-medium text-forest hover:underline"
                          >
                            Details
                          </button>
                          {req.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(req)}
                              className="text-xs font-medium text-error hover:underline"
                            >
                              Cancel
                            </button>
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

      {/* New Deposit Request Modal */}
      <Modal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="New Simulated Deposit Request"
        subtitle="Internal workflow — routed to your assigned agent & super administrator"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-card border border-champagne/40 bg-champagne-soft/60 p-3.5 text-xs leading-relaxed text-charcoal">
            <strong>Simulation Notice:</strong> This internal request creates a pending record for
            demo review. It does not connect to any bank, card processor, or real funds.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Requested Amount ({currency}) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              step="10"
              {...register('amount')}
              className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 text-sm font-semibold tabular-nums text-charcoal focus:border-forest focus:outline-none"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-error">{errors.amount.message}</p>
            )}
          </div>

          <CustomSelect
            label="Internal Deposit Method"
            value={selectedMethod}
            onChange={(val) => setValue('method', val as DepositMethod)}
            options={[
              { value: 'Agent-assisted deposit', label: 'Agent-assisted deposit' },
              { value: 'Internal account credit', label: 'Internal account credit' },
              { value: 'Manual deposit request', label: 'Manual deposit request' },
            ]}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Transaction Reference <span className="text-error">*</span>
            </label>
            <input
              {...register('reference')}
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/60 px-3.5 font-mono text-xs text-charcoal focus:border-forest focus:outline-none"
            />
            {errors.reference && (
              <p className="mt-1 text-xs text-error">{errors.reference.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Optional Note
            </label>
            <textarea
              {...register('note')}
              rows={3}
              placeholder="Optional note for your assigned agent..."
              className="w-full rounded-btn border border-warm-border bg-soft-white p-3 text-sm text-charcoal focus:border-forest focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailReq !== null}
        onClose={() => setDetailReq(null)}
        title={detailReq ? `Deposit Request · ${detailReq.reference}` : ''}
        footer={
          <Button variant="primary" onClick={() => setDetailReq(null)}>
            Close
          </Button>
        }
      >
        {detailReq && (
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Status</dt>
              <dd>
                <Badge tone={statusToBadgeTone(detailReq.status)}>{detailReq.status}</Badge>
              </dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Simulated Amount</dt>
              <dd className="font-semibold tabular-nums">
                {formatCurrency(detailReq.amount, currency)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Method</dt>
              <dd className="font-medium text-charcoal">{detailReq.method}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Assigned Agent</dt>
              <dd className="font-medium text-charcoal">{detailReq.agentName}</dd>
            </div>
            <div className="flex justify-between border-b border-warm-border pb-2">
              <dt className="text-muted-grey">Submitted</dt>
              <dd className="text-charcoal">{formatDateTime(detailReq.submittedAt)}</dd>
            </div>
            {detailReq.reviewedBy && (
              <div className="flex justify-between border-b border-warm-border pb-2">
                <dt className="text-muted-grey">Reviewed By</dt>
                <dd className="font-medium text-charcoal">{detailReq.reviewedBy}</dd>
              </div>
            )}
            {detailReq.note && (
              <div>
                <dt className="text-muted-grey mb-1">Customer Note</dt>
                <dd className="rounded-btn bg-ivory p-2.5 text-charcoal">{detailReq.note}</dd>
              </div>
            )}
            {detailReq.rejectionReason && (
              <div className="rounded-btn border border-error/25 bg-error-bg p-3 text-error flex items-start gap-2">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{detailReq.rejectionReason}</span>
              </div>
            )}
          </dl>
        )}
      </Modal>

      <ConfirmationDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          const res = cancelDepositRequest(cancelTarget.id, customer.id);
          if (res.ok) {
            addToast('info', 'Request Cancelled', res.message);
          } else {
            addToast('error', 'Action Failed', res.message);
          }
        }}
        title="Cancel Pending Deposit Request?"
        description="Cancelling removes this simulated deposit from agent and administrator review queues."
        confirmLabel="Cancel Request"
        tone="warning"
      />
    </CustomerLayout>
  );
};

