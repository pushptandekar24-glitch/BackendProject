import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Team, Invitation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import {
  ArrowLeft,
  Users,
  UserMinus,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  Crown,
  UserPlus,
  Mail,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

export const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      if (res.data && res.data.success) {
        setTeam(res.data.team);
        setInvitations(res.data.invitations || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Team not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const isLeader = team && user && team.leader?._id === user._id;
  const isMember =
    team && user && team.members?.some((m) => m._id === user._id);

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? All pending invitations will be cancelled.')) return;
    try {
      await api.delete(`/teams/${id}`);
      navigate('/teams');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleLeaveOrRemoveMember = async (memberId: string) => {
    const isSelf = user?._id === memberId;
    const confirmMsg = isSelf
      ? 'Are you sure you want to leave this team?'
      : 'Are you sure you want to remove this member from the team?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.post(`/teams/${id}/members/remove`, { memberId });
      if (isSelf) {
        navigate('/teams');
      } else {
        fetchTeam();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCancelInvitation = async (inviteId: string) => {
    try {
      await api.delete(`/invitations/${inviteId}`);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Team not found'}</h2>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Teams
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={team.status} />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              {team.hackathon?.title}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {team.name}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {team.description || 'No description provided.'}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-700">
              Capacity: {team.members.length}/{team.maxMembers} Members
            </span>
            <span>•</span>
            <Link
              to={`/hackathons/${team.hackathon?._id}`}
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              Hackathon Page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {isLeader ? (
            <>
              <Link
                to="/teammates"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Invite Teammates
              </Link>
              <button
                type="button"
                onClick={handleDeleteTeam}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Disband Team
              </button>
            </>
          ) : isMember ? (
            <button
              type="button"
              onClick={() => handleLeaveOrRemoveMember(user!._id)}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <UserMinus className="w-4 h-4" /> Leave Team
            </button>
          ) : null}
        </div>
      </div>

      {/* Grid: Roster & Open Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Member Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Team Roster ({team.members.length}/{team.maxMembers})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.members.map((member) => {
              const isTeamLeader = member._id === team.leader?._id;
              return (
                <div
                  key={member._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/teammates/${member._id}`}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors truncate"
                        >
                          {member.name}
                        </Link>
                        {isTeamLeader && (
                          <span
                            title="Team Leader"
                            className="text-amber-500 flex-shrink-0"
                          >
                            <Crown className="w-4 h-4 fill-amber-400" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 truncate">{member.college}</p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {member.preferredRole || 'Developer'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/teammates/${member._id}`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      View Profile
                    </Link>

                    {isLeader && !isTeamLeader && (
                      <button
                        type="button"
                        onClick={() => handleLeaveOrRemoveMember(member._id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending / Active Invitations (for leader only) */}
          {isLeader && invitations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Outgoing Invitations ({invitations.length})
              </h3>

              <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                {invitations.map((invite) => (
                  <div
                    key={invite._id}
                    className="p-4 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-700 font-bold flex items-center justify-center">
                        {invite.receiver?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{invite.receiver?.name}</p>
                        <p className="text-slate-400">{invite.receiver?.college}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={invite.status} size="sm" />
                      {invite.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelInvitation(invite._id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Looking For / Skills */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Roles & Tech Needed</h3>
            <p className="text-xs text-slate-500">
              This squad is actively searching for builders with these skills:
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {team.requiredSkills && team.requiredSkills.length > 0 ? (
                team.requiredSkills.map((skill) => (
                  <SkillTag key={skill} label={skill} size="md" />
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No specific skills listed.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/teammates"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs text-center block transition-colors"
              >
                Search Students with These Skills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

