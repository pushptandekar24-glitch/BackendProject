import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Hackathon, Team } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Globe,
  PlusCircle,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';

export const HackathonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Team Modal State
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamSkills, setTeamSkills] = useState('');
  const [teamMaxMembers, setTeamMaxMembers] = useState(4);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  const fetchHackathonDetail = async () => {
    try {
      const res = await api.get(`/hackathons/${id}`);
      if (res.data && res.data.success) {
        setHackathon(res.data.hackathon);
        setTeams(res.data.teams || []);
        if (res.data.hackathon.maxTeamSize) {
          setTeamMaxMembers(res.data.hackathon.maxTeamSize);
        }
      }
    } catch (err: any) {
      console.error('Error fetching hackathon:', err);
      setError(err.response?.data?.message || 'Hackathon not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathonDetail();
  }, [id]);

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this hackathon listing?')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      navigate('/hackathons');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete hackathon');
    }
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      setTeamError('Team name is required.');
      return;
    }

    setTeamSubmitting(true);
    setTeamError(null);

    try {
      const payload = {
        name: teamName,
        description: teamDesc,
        hackathonId: id,
        requiredSkills: teamSkills.split(',').map((s) => s.trim()).filter(Boolean),
        maxMembers: teamMaxMembers,
      };

      const res = await api.post('/teams', payload);
      if (res.data && res.data.success) {
        setIsCreateTeamOpen(false);
        setTeamName('');
        setTeamDesc('');
        setTeamSkills('');
        fetchHackathonDetail();
      }
    } catch (err: any) {
      setTeamError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setTeamSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading hackathon details...</p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Hackathon not found'}</h2>
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all hackathons
        </Link>
      </div>
    );
  }

  const isOrganizer = user && hackathon.organizer && hackathon.organizer._id === user._id;
  const userTeam = teams.find(
    (t) => t.members.some((m) => m._id === user?._id) || t.leader?._id === user?._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <Link
        to="/hackathons"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Hackathons
      </Link>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-card">
        <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-900">
          <img
            src={
              hackathon.bannerUrl ||
              'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
            }
            alt={hackathon.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <StatusBadge status={hackathon.mode} />
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              {hackathon.theme}
            </span>
          </div>

          {/* Action buttons for owner */}
          {isOrganizer && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteListing}
                className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Listing
              </button>
            </div>
          )}

          {/* Title & info over banner */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {hackathon.title}
            </h1>
            {hackathon.tagline && (
              <p className="text-xs sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                {hackathon.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="p-6 bg-white border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Prize Pool</div>
              <div className="text-sm font-bold text-slate-900">{hackathon.prizePool}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Dates</div>
              <div className="text-sm font-bold text-slate-900">
                {new Date(hackathon.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(hackathon.endDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Location</div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[130px]">
                {hackathon.location}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Team Size</div>
              <div className="text-sm font-bold text-slate-900">
                {hackathon.minTeamSize}-{hackathon.maxTeamSize} Members
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* About section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-5">
            <h2 className="text-xl font-bold text-slate-900">About the Hackathon</h2>
            <div className="prose prose-slate text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {hackathon.description}
            </div>

            {/* Required Skills */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Recommended Skills & Roles
              </h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.skillsRequired.map((skill) => (
                  <SkillTag key={skill} label={skill} size="md" />
                ))}
              </div>
            </div>

            {/* Organizer Card */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-700 font-bold flex items-center justify-center">
                  {hackathon.organizer?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Organized by {hackathon.organizer?.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{hackathon.organizer?.college}</p>
                </div>
              </div>

              {hackathon.websiteUrl && (
                <a
                  href={hackathon.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Teams Formed for This Hackathon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Registered Teams ({teams.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Join an open squad or review competing rosters
                </p>
              </div>

              {isAuthenticated && !userTeam && (
                <button
                  type="button"
                  onClick={() => setIsCreateTeamOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create a Team
                </button>
              )}
            </div>

            {userTeam && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  You are registered for this hackathon with team: <strong>{userTeam.name}</strong>
                </span>
                <Link
                  to={`/teams/${userTeam._id}`}
                  className="font-bold underline hover:text-indigo-700"
                >
                  View Your Team
                </Link>
              </div>
            )}

            {teams.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-900">No teams formed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first student to create a team for {hackathon.title}!
                </p>
                {isAuthenticated && !userTeam && (
                  <button
                    onClick={() => setIsCreateTeamOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Create First Team
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        {t.members.length}/{t.maxMembers} Members
                      </span>
                      <Link
                        to={`/teams/${t._id}`}
                        className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        View Team <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Registration Card & Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Registration Status</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Deadline:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(hackathon.registrationDeadline).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Teams:</span>
                <span className="font-semibold text-slate-800">{teams.length} Squads</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-slate-800">{hackathon.mode}</span>
              </div>
            </div>

            {isAuthenticated ? (
              userTeam ? (
                <Link
                  to={`/teams/${userTeam._id}`}
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 block transition-colors"
                >
                  Manage Your Team
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreateTeamOpen(true)}
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Team for This Hackathon
                </button>
              )
            ) : (
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 block transition-colors shadow-sm"
              >
                Sign in to Register or Form Team
              </Link>
            )}

            <Link
              to="/teammates"
              className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 block transition-colors"
            >
              Find Students with Matching Skills
            </Link>
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Create a Team</h3>
                <p className="text-xs text-slate-500">For {hackathon.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTeamOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {teamError && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{teamError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeamSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. ByteCraft Studio"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Vision / Description
                </label>
                <textarea
                  rows={3}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="What are you building? What kind of teammates are you looking for?"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Skills You're Looking For (Comma separated)
                </label>
                <input
                  type="text"
                  value={teamSkills}
                  onChange={(e) => setTeamSkills(e.target.value)}
                  placeholder="UI/UX Designer, Python, Docker, Smart Contracts"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Maximum Team Size (Max: {hackathon.maxTeamSize})
                </label>
                <input
                  type="number"
                  min={1}
                  max={hackathon.maxTeamSize || 10}
                  value={teamMaxMembers}
                  onChange={(e) => setTeamMaxMembers(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={teamSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  {teamSubmitting ? (
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

