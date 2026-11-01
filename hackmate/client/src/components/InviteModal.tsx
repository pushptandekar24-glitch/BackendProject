import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react';
import api from '../services/api';
import { User, Team } from '../types';
import { useAuth } from '../context/AuthContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onSuccess?: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setError(null);
      setSuccessMsg(null);
      setMessage(
        targetUser
          ? `Hey ${targetUser.name}! We saw your profile on HackMate and would love to have you on our team.`
          : ''
      );
      fetchMyLedTeams();
    }
  }, [isOpen, targetUser, user]);

  const fetchMyLedTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await api.get('/teams');
      if (res.data && res.data.success) {
        // Only teams where current user is leader and team is Open
        const ledTeams = res.data.teams.filter(
          (t: Team) =>
            t.leader &&
            t.leader._id === user?._id &&
            t.status === 'Open' &&
            t.members.length < t.maxMembers
        );
        setTeams(ledTeams);
        if (ledTeams.length > 0) {
          setSelectedTeamId(ledTeams[0]._id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load teams:', err);
      setError('Failed to load your active teams.');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !targetUser) {
      setError('Please select a team to invite this student to.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/invitations', {
        teamId: selectedTeamId,
        receiverId: targetUser._id,
        message,
      });

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || `Invitation sent to ${targetUser.name}!`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Could not send invitation. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Send Team Invitation</h3>
              <p className="text-xs text-slate-500">Invite a student to collaborate</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target User Info Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            {targetUser.avatar ? (
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base">
                {targetUser.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 truncate">{targetUser.name}</h4>
              <p className="text-xs text-slate-500 truncate">{targetUser.college}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                {targetUser.preferredRole}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loadingTeams ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs">Fetching your teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                You do not lead any open teams right now.
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Create a team for a hackathon first, then you can invite teammates to join your roster!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Your Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                >
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.hackathon?.title} — {t.members.length}/{t.maxMembers} members)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invitation Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={300}
                  placeholder="Tell them why they would be a great fit for your project..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none text-slate-800 placeholder:text-slate-400"
                />
                <span className="text-[11px] text-slate-400 float-right mt-1">
                  {message.length}/300
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedTeamId}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

