import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DashboardSummary, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import { InviteModal } from '../components/InviteModal';
import {
  Layers,
  Mail,
  Compass,
  Users,
  Calendar,
  MapPin,
  Check,
  X,
  Loader2,
  AlertCircle,
  PlusCircle,
  UserPlus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [inviteTargetUser, setInviteTargetUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/auth/dashboard');
      if (res.data && res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError('Failed to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRespondInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    setActionLoadingId(inviteId);
    try {
      await api.put(`/invitations/${inviteId}/respond`, { status });
      // Refresh dashboard to show updated team list & invitation counts
      await fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your HackMate dashboard...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8" />
          <p className="font-semibold">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboard();
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-indigo-400/40 shadow-md">
                {user?.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Student Builder Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {user?.college} • <span className="text-indigo-300">{user?.preferredRole}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/hackathons"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              Find Hackathons
            </Link>
            <Link
              to="/teammates"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold border border-indigo-400/30 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Browse Students
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{summary.stats.myTeamsCount}</div>
            <div className="text-[11px] sm:text-xs text-indigo-200 mt-0.5">Active Teams</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {summary.stats.pendingInvitesCount}
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-200 mt-0.5">Pending Invitations</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              {summary.stats.upcomingHackathonsCount}
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-200 mt-0.5">Upcoming Matches</div>
          </div>
        </div>
      </div>

      {/* Pending Invitations Section (if any) */}
      {summary.pendingInvitations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-lg">
              <Mail className="w-5 h-5" />
              Pending Team Invitations ({summary.pendingInvitations.length})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.pendingInvitations.map((invite) => (
              <div
                key={invite._id}
                className="bg-white rounded-2xl border-2 border-amber-200/70 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                        {invite.hackathon?.title}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        Team: {invite.team?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Invited by <strong className="text-slate-700">{invite.sender?.name}</strong>{' '}
                        ({invite.sender?.college})
                      </p>
                    </div>
                    <StatusBadge status={invite.status} />
                  </div>

                  {invite.message && (
                    <blockquote className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border-l-2 border-amber-400">
                      "{invite.message}"
                    </blockquote>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={actionLoadingId === invite._id}
                    onClick={() => handleRespondInvite(invite._id, 'declined')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={actionLoadingId === invite._id}
                    onClick={() => handleRespondInvite(invite._id, 'accepted')}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1.5"
                  >
                    {actionLoadingId === invite._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Accept Invitation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: My Teams & Suggested Teammates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): My Active Teams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              My Current Teams ({summary.myTeams.length})
            </h2>
            <Link
              to="/teams"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              Manage all teams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {summary.myTeams.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">You are not in any teams yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover a hackathon you're interested in and create a new team, or check your invitations above!
              </p>
              <Link
                to="/hackathons"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Explore & Create Team
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.myTeams.map((team) => {
                const isLeader = team.leader._id === user?._id;
                return (
                  <div
                    key={team._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                          {team.hackathon?.title}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                          {team.name}
                          {isLeader && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-md uppercase">
                              Team Leader
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <StatusBadge status={team.status} />
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {team.members.length}/{team.maxMembers} members
                        </span>
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {team.description}
                      </p>
                    )}

                    {/* Member Avatars */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Members:</span>
                        <div className="flex -space-x-2 overflow-hidden">
                          {team.members.map((member) => (
                            <div
                              key={member._id}
                              title={`${member.name} (${member.preferredRole || 'Member'})`}
                              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden"
                            >
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                member.name.charAt(0)
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        to={`/teams/${team._id}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Team Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Suggested Teammates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Suggested Students
            </h2>
            <Link
              to="/teammates"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse all
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle divide-y divide-slate-100">
            {summary.suggestedTeammates.slice(0, 5).map((teammate) => (
              <div key={teammate._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {teammate.avatar ? (
                    <img
                      src={teammate.avatar}
                      alt={teammate.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {teammate.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/teammates/${teammate._id}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
                    >
                      {teammate.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate">{teammate.college}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 truncate mt-0.5">
                      {teammate.preferredRole}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInviteTargetUser(teammate);
                    setIsInviteModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Hackathons Grid */}
      <section className="space-y-6 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recommended Hackathons</h2>
            <p className="text-xs text-slate-500">Upcoming competitions open for team registration</p>
          </div>
          <Link
            to="/hackathons"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Explore all listings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {summary.recommendedHackathons.map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {h.theme}
                  </span>
                  <StatusBadge status={h.mode} size="sm" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-indigo-600">
                  <Link to={`/hackathons/${h._id}`}>{h.title}</Link>
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>
                    {new Date(h.startDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{h.prizePool}</span>
                <Link
                  to={`/hackathons/${h._id}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite Modal Component */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        targetUser={inviteTargetUser}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
};

