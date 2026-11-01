import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Team, Invitation, Hackathon } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import {
  Layers,
  Mail,
  Send,
  Users,
  PlusCircle,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-teams' | 'received' | 'sent' | 'all'>('my-teams');

  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([]);
  const [sentInvites, setSentInvites] = useState<Invitation[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Create Team Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamSkills, setTeamSkills] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [teamsRes, receivedRes, sentRes, hackRes] = await Promise.all([
        api.get('/teams'),
        api.get('/invitations/received'),
        api.get('/invitations/sent'),
        api.get('/hackathons'),
      ]);

      if (teamsRes.data?.success) {
        setAllTeams(teamsRes.data.teams);
        if (user) {
          const userTeams = teamsRes.data.teams.filter((t: Team) =>
            t.members.some((m) => m._id === user._id) || t.leader?._id === user._id
          );
          setMyTeams(userTeams);
        }
      }

      if (receivedRes.data?.success) {
        setReceivedInvites(receivedRes.data.invitations);
      }

      if (sentRes.data?.success) {
        setSentInvites(sentRes.data.invitations);
      }

      if (hackRes.data?.success) {
        setHackathons(hackRes.data.hackathons);
        if (hackRes.data.hackathons.length > 0) {
          setSelectedHackathonId(hackRes.data.hackathons[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load teams & invitations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
    setActionLoadingId(inviteId);
    try {
      await api.put(`/invitations/${inviteId}/respond`, { status });
      await fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !selectedHackathonId) {
      setCreateError('Team name and Hackathon are required.');
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const res = await api.post('/teams', {
        name: teamName,
        description: teamDesc,
        hackathonId: selectedHackathonId,
        requiredSkills: teamSkills.split(',').map((s) => s.trim()).filter(Boolean),
        maxMembers,
      });

      if (res.data?.success) {
        setIsCreateOpen(false);
        setTeamName('');
        setTeamDesc('');
        setTeamSkills('');
        fetchAllData();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Teams & Invitations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your rosters, coordinate with teammates, and review invitations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Team
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto scrollbar-none pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('my-teams')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'my-teams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          My Teams ({myTeams.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          Received Invitations ({receivedInvites.filter((i) => i.status === 'pending').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent Invitations ({sentInvites.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          All Open Teams ({allTeams.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your teams...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: MY TEAMS */}
          {activeTab === 'my-teams' && (
            <div>
              {myTeams.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-lg">No teams yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't formed or joined any teams yet. Create a team for an upcoming hackathon or accept an invitation!
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Create Your First Team
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeams.map((team) => {
                    const isLeader = team.leader?._id === user?._id;
                    return (
                      <div
                        key={team._id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                                {team.hackathon?.title}
                              </span>
                              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mt-0.5">
                                {team.name}
                              </h3>
                            </div>
                            <StatusBadge status={team.status} size="sm" />
                          </div>

                          {isLeader && (
                            <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md uppercase">
                              Leader
                            </span>
                          )}

                          {team.description && (
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {team.description}
                            </p>
                          )}

                          {/* Member List */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="text-[11px] font-semibold text-slate-400">
                              Roster ({team.members.length}/{team.maxMembers}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {team.members.map((m) => (
                                <span
                                  key={m._id}
                                  className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
                                >
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Needed Skills */}
                          {team.requiredSkills && team.requiredSkills.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <div className="text-[11px] font-semibold text-slate-400">
                                Looking for:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {team.requiredSkills.map((s) => (
                                  <SkillTag key={s} label={s} size="sm" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <Link
                            to={`/teams/${team._id}`}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold text-center border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
                          >
                            Manage Team Roster <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVED INVITATIONS */}
          {activeTab === 'received' && (
            <div>
              {receivedInvites.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-lg">No received invitations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When teams invite you to join their hackathon squads, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedInvites.map((invite) => (
                    <div
                      key={invite._id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
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
                          <blockquote className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border-l-2 border-indigo-400">
                            "{invite.message}"
                          </blockquote>
                        )}
                      </div>

                      {invite.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={actionLoadingId === invite._id}
                            onClick={() => handleRespond(invite._id, 'declined')}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === invite._id}
                            onClick={() => handleRespond(invite._id, 'accepted')}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            {actionLoadingId === invite._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Accept Invitation
                          </button>
                        </div>
                      ) : (
                        <div className="text-right text-xs text-slate-400 capitalize">
                          Invitation {invite.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT INVITATIONS */}
          {activeTab === 'sent' && (
            <div>
              {sentInvites.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                  <Send className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-lg">No sent invitations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't sent any invitations yet. Go to Find Teammates to invite builders to your team.
                  </p>
                  <Link
                    to="/teammates"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Find Students to Invite
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-subtle divide-y divide-slate-100">
                  {sentInvites.map((invite) => (
                    <div
                      key={invite._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        {invite.receiver?.avatar ? (
                          <img
                            src={invite.receiver.avatar}
                            alt={invite.receiver.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {invite.receiver?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {invite.receiver?.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Invited to: <strong>{invite.team?.name}</strong> ({invite.hackathon?.title})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <StatusBadge status={invite.status} />
                        <span className="text-xs text-slate-400">
                          {new Date(invite.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ALL OPEN TEAMS */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTeams.map((team) => (
                <div
                  key={team._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                          {team.hackathon?.title}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                      </div>
                      <StatusBadge status={team.status} size="sm" />
                    </div>

                    {team.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {team.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Lead: <strong>{team.leader?.name}</strong>
                      </span>
                      <span>
                        {team.members.length}/{team.maxMembers} Members
                      </span>
                    </div>

                    {team.requiredSkills && team.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {team.requiredSkills.map((s) => (
                          <SkillTag key={s} label={s} size="sm" />
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/teams/${team._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold text-center border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
                  >
                    View Team Page <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Create a New Team</h3>
                <p className="text-xs text-slate-500">Register a team for an upcoming hackathon</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Hackathon *
                </label>
                <select
                  value={selectedHackathonId}
                  onChange={(e) => setSelectedHackathonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-medium text-slate-800"
                >
                  {hackathons.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.title} ({h.mode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. NeuralNexus"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Project Idea
                </label>
                <textarea
                  rows={3}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="What is your team building? What roles do you need?"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={teamSkills}
                  onChange={(e) => setTeamSkills(e.target.value)}
                  placeholder="UI/UX Designer, PyTorch, React, Cloud"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Max Members (1 - 6)
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  {createSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Form Team'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

