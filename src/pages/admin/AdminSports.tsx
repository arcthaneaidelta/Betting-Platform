import React, { useState } from 'react';
import { Plus, Star, Edit3 } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Modal } from '@/components/common/Modal';
import { SPORTS_CATEGORIES } from '@/data/mockData';
import { useAurelStore } from '@/store/useAurelStore';
import { formatOdds } from '@/utils/formatters';
import { Match, MatchStatus, SportKey } from '@/types';

export const AdminSports: React.FC = () => {
  const [sportFilter, setSportFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);

  // Add event form
  const [newSport, setNewSport] = useState<SportKey>('football');
  const [newCompetition, setNewCompetition] = useState('European Champions Showcase');
  const [newHome, setNewHome] = useState('');
  const [newAway, setNewAway] = useState('');
  const [newStatus, setNewStatus] = useState<MatchStatus>('upcoming');
  const [newHomeOdds, setNewHomeOdds] = useState('1.95');
  const [newDrawOdds, setNewDrawOdds] = useState('3.40');
  const [newAwayOdds, setNewAwayOdds] = useState('3.80');

  const matches = useAurelStore((s) => s.matches);
  const addMatch = useAurelStore((s) => s.addMatch);
  const updateMatchStatus = useAurelStore((s) => s.updateMatchStatus);
  const toggleMatchFeatured = useAurelStore((s) => s.toggleMatchFeatured);
  const updateMarketOptionOdds = useAurelStore((s) => s.updateMarketOptionOdds);
  const addToast = useAurelStore((s) => s.addToast);

  const filtered = matches.filter((m) => sportFilter === 'all' || m.sport === sportFilter);

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHome.trim() || !newAway.trim()) return;
    const hShort = newHome.trim().slice(0, 3).toUpperCase();
    const aShort = newAway.trim().slice(0, 3).toUpperCase();
    const res = addMatch({
      sport: newSport,
      competition: newCompetition.trim() || 'Demo Cup',
      homeTeam: { id: `T-${hShort}`, name: newHome.trim(), shortName: hShort, primaryColor: '#203B32' },
      awayTeam: { id: `T-${aShort}`, name: newAway.trim(), shortName: aShort, primaryColor: '#82998B' },
      startTime: new Date(Date.now() + 3 * 3600000).toISOString(),
      status: newStatus,
      minute: newStatus === 'live' ? "12'" : undefined,
      score: newStatus === 'live' ? { home: 0, away: 0 } : undefined,
      featured: true,
      stats: { venue: 'AUREL Demo Stadium', weather: 'Clear' },
      markets: [
        {
          id: 'mkt-winner',
          name: 'Match Winner',
          category: 'main',
          mutuallyExclusive: true,
          options: [
            { id: 'home', label: newHome.trim(), odds: Number(newHomeOdds) || 1.95 },
            ...(newSport === 'football'
              ? [{ id: 'draw', label: 'Draw', odds: Number(newDrawOdds) || 3.4 }]
              : []),
            { id: 'away', label: newAway.trim(), odds: Number(newAwayOdds) || 3.6 },
          ],
        },
      ],
    });
    if (res.ok) {
      addToast('success', 'Fictional Event Published', 'Immediately visible in Customer & Public sportsbooks.');
      setAddOpen(false);
      setNewHome('');
      setNewAway('');
    }
  };

  const liveEditMatch = editMatch
    ? matches.find((m) => m.id === editMatch.id) || editMatch
    : null;

  return (
    <AdminLayout title="Sports & Events Management">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Sports, Markets &amp; Demo Odds Control
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Add fictional events, adjust demo odds, or toggle featured status. Updates propagate
              immediately across all portals.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Fictional Event
          </Button>
        </div>

        <div className="max-w-xs">
          <CustomSelect
            value={sportFilter}
            onChange={setSportFilter}
            options={[
              { value: 'all', label: `All Sports (${matches.length})` },
              ...SPORTS_CATEGORIES.map((s) => ({ value: s.key, label: s.label })),
            ]}
          />
        </div>

        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                <tr>
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">Sport / Competition</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Primary Odds</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-ivory/40">
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-charcoal">
                        {m.homeTeam.name} vs {m.awayTeam.name}
                      </p>
                      <p className="text-[11px] text-muted-grey">{m.id}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs capitalize font-medium text-charcoal">{m.sport}</p>
                      <p className="text-[11px] text-muted-grey">{m.competition}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={statusToBadgeTone(m.status)}>
                        {m.status} {m.minute || ''}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          toggleMatchFeatured(m.id);
                          addToast('info', 'Featured Status Updated', `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`);
                        }}
                        className={`inline-flex items-center gap-1 rounded-btn border px-2.5 py-1 text-xs font-medium ${
                          m.featured
                            ? 'border-champagne bg-champagne-soft text-forest'
                            : 'border-warm-border bg-ivory text-muted-grey'
                        }`}
                      >
                        <Star className="h-3 w-3" />
                        {m.featured ? 'Featured' : 'Standard'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-charcoal">
                      {m.markets[0]?.options.map((o) => formatOdds(o.odds)).join(' / ')}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditMatch(m)}>
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Odds &amp; Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Match Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Fictional Demo Event"
      >
        <form onSubmit={handleAddMatch} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <CustomSelect
              label="Sport Category"
              value={newSport}
              onChange={(val) => setNewSport(val as SportKey)}
              options={SPORTS_CATEGORIES.map((s) => ({ value: s.key, label: s.label }))}
            />
            <CustomSelect
              label="Initial Status"
              value={newStatus}
              onChange={(val) => setNewStatus(val as MatchStatus)}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'live', label: 'Simulated Live' },
              ]}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Competition Name</label>
            <input
              value={newCompetition}
              onChange={(e) => setNewCompetition(e.target.value)}
              className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Home Team *</label>
              <input
                value={newHome}
                onChange={(e) => setNewHome(e.target.value)}
                required
                placeholder="e.g. Alpine United"
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Away Team *</label>
              <input
                value={newAway}
                onChange={(e) => setNewAway(e.target.value)}
                required
                placeholder="e.g. Coastal Athletic"
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Home Odds</label>
              <input
                type="number"
                step="0.05"
                value={newHomeOdds}
                onChange={(e) => setNewHomeOdds(e.target.value)}
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums"
              />
            </div>
            {newSport === 'football' && (
              <div>
                <label className="mb-1 block text-xs font-medium">Draw Odds</label>
                <input
                  type="number"
                  step="0.05"
                  value={newDrawOdds}
                  onChange={(e) => setNewDrawOdds(e.target.value)}
                  className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium">Away Odds</label>
              <input
                type="number"
                step="0.05"
                value={newAwayOdds}
                onChange={(e) => setNewAwayOdds(e.target.value)}
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Odds & Status Modal */}
      <Modal
        open={liveEditMatch !== null}
        onClose={() => setEditMatch(null)}
        title={
          liveEditMatch
            ? `${liveEditMatch.homeTeam.name} vs ${liveEditMatch.awayTeam.name}`
            : ''
        }
        subtitle="Changes apply immediately across Customer & Public sportsbooks"
        footer={
          <Button variant="primary" onClick={() => setEditMatch(null)}>
            Done
          </Button>
        }
      >
        {liveEditMatch && (
          <div className="space-y-5">
            <CustomSelect
              label="Event Status"
              value={liveEditMatch.status}
              onChange={(val) => {
                updateMatchStatus(
                  liveEditMatch.id,
                  val as MatchStatus,
                  val === 'live' ? "45'" : undefined
                );
                addToast('success', 'Status Updated', `Fixture marked as ${val}.`);
              }}
              options={[
                { value: 'live', label: 'Simulated Live' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'finished', label: 'Finished' },
              ]}
            />

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">
                Decimal Odds Editor
              </p>
              {liveEditMatch.markets.map((mkt) => (
                <div
                  key={mkt.id}
                  className="rounded-card border border-warm-border bg-ivory/45 p-3.5 space-y-2.5"
                >
                  <p className="text-xs font-semibold text-charcoal">{mkt.name}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {mkt.options.map((opt) => (
                      <div key={opt.id} className="space-y-1">
                        <label className="block truncate text-[11px] text-muted-grey">
                          {opt.label}
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="1.01"
                          value={opt.odds}
                          onChange={(e) =>
                            updateMarketOptionOdds(
                              liveEditMatch.id,
                              mkt.id,
                              opt.id,
                              parseFloat(e.target.value) || 1.01
                            )
                          }
                          className="h-9 w-full rounded-btn border border-warm-border bg-soft-white px-2.5 text-xs font-semibold tabular-nums focus:border-forest focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

