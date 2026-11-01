import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Hackathon } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const THEMES = [
  'All',
  'AI & Machine Learning',
  'Open Innovation',
  'FinTech & Web3',
  'Healthcare & Biotech',
  'Climate Tech',
  'Cybersecurity',
  'EdTech',
];

const MODES = ['All', 'Online', 'In-Person', 'Hybrid'];

export const ExploreHackathonsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');

  // Create Hackathon Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newHackathon, setNewHackathon] = useState({
    title: '',
    tagline: '',
    description: '',
    theme: 'AI & Machine Learning',
    mode: 'Online',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    prizePool: '$10,000',
    minTeamSize: 1,
    maxTeamSize: 4,
    skillsRequired: '',
    websiteUrl: '',
    bannerUrl: '',
  });

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedTheme !== 'All') params.theme = selectedTheme;
      if (selectedMode !== 'All') params.mode = selectedMode;
      if (skillFilter) params.skill = skillFilter;

      const res = await api.get('/hackathons', { params });
      if (res.data && res.data.success) {
        setHackathons(res.data.hackathons);
      }
    } catch (err) {
      console.error('Error fetching hackathons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchHackathons();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedTheme, selectedMode, skillFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const payload = {
        ...newHackathon,
        skillsRequired: newHackathon.skillsRequired
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await api.post('/hackathons', payload);
      if (res.data && res.data.success) {
        setIsCreateOpen(false);
        setNewHackathon({
          title: '',
          tagline: '',
          description: '',
          theme: 'AI & Machine Learning',
          mode: 'Online',
          location: '',
          startDate: '',
          endDate: '',
          registrationDeadline: '',
          prizePool: '$10,000',
          minTeamSize: 1,
          maxTeamSize: 4,
          skillsRequired: '',
          websiteUrl: '',
          bannerUrl: '',
        });
        fetchHackathons();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create hackathon.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Hackathons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover student marathons, assemble your team, and compete for top prizes
          </p>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post a Hackathon
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, keyword, or tech stack..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
            />
          </div>

          {/* Mode Dropdown */}
          <div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-700"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  Format: {m}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Tag search */}
          <div>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. React, Python)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Theme Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pl-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Theme:
          </span>
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTheme(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedTheme === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Discovering competitions...</p>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No hackathons match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your theme, format, or search keywords to find other collegiate hackathons.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedTheme('All');
              setSelectedMode('All');
              setSkillFilter('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => {
            const isOwner = user && h.organizer && h.organizer._id === user._id;

            return (
              <div
                key={h._id}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Banner Thumbnail */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      h.bannerUrl ||
                      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <StatusBadge status={h.mode} />
                    {isOwner && (
                      <span className="bg-indigo-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Your Listing
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {h.prizePool}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-600 uppercase tracking-wide">
                        {h.theme}
                      </span>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Team: {h.minTeamSize}-{h.maxTeamSize}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      <Link to={`/hackathons/${h._id}`}>{h.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {h.tagline || h.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(h.startDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{h.location}</span>
                      </div>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.skillsRequired.slice(0, 3).map((skill) => (
                        <SkillTag key={skill} label={skill} size="sm" />
                      ))}
                      {h.skillsRequired.length > 3 && (
                        <span className="text-[11px] font-medium text-slate-400 self-center">
                          +{h.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        <strong className="text-indigo-600 font-bold">{h.teamsCount || 0}</strong>{' '}
                        teams competing
                      </span>
                      <Link
                        to={`/hackathons/${h._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold border border-slate-200/60 transition-colors flex items-center gap-1"
                      >
                        Details & Teams <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Hackathon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Post a New Hackathon</h3>
                <p className="text-xs text-slate-500">List an upcoming hackathon for college students</p>
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
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  required
                  value={newHackathon.title}
                  onChange={(e) => setNewHackathon({ ...newHackathon, title: e.target.value })}
                  placeholder="e.g. Stanford AI Winter Hackathon"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catchy Tagline
                </label>
                <input
                  type="text"
                  value={newHackathon.tagline}
                  onChange={(e) => setNewHackathon({ ...newHackathon, tagline: e.target.value })}
                  placeholder="e.g. 48 hours to build autonomous web agents"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Theme / Category *
                  </label>
                  <select
                    value={newHackathon.theme}
                    onChange={(e) => setNewHackathon({ ...newHackathon, theme: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  >
                    {THEMES.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Format *
                  </label>
                  <select
                    value={newHackathon.mode}
                    onChange={(e) => setNewHackathon({ ...newHackathon, mode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location (Venue or Virtual)
                </label>
                <input
                  type="text"
                  value={newHackathon.location}
                  onChange={(e) => setNewHackathon({ ...newHackathon, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Virtual Worldwide"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newHackathon.startDate}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newHackathon.endDate}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Reg. Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newHackathon.registrationDeadline}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, registrationDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={newHackathon.prizePool}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, prizePool: e.target.value })
                    }
                    placeholder="$25,000"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newHackathon.minTeamSize}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        minTeamSize: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newHackathon.maxTeamSize}
                    onChange={(e) =>
                      setNewHackathon({
                        ...newHackathon,
                        maxTeamSize: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Required / Recommended Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={newHackathon.skillsRequired}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, skillsRequired: e.target.value })
                  }
                  placeholder="React, TypeScript, Python, PyTorch, Figma"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newHackathon.description}
                  onChange={(e) =>
                    setNewHackathon({ ...newHackathon, description: e.target.value })
                  }
                  placeholder="Describe tracks, prizes, eligibility, and rules..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={newHackathon.websiteUrl}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, websiteUrl: e.target.value })
                    }
                    placeholder="https://hackathon.org"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={newHackathon.bannerUrl}
                    onChange={(e) =>
                      setNewHackathon({ ...newHackathon, bannerUrl: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Hackathon'
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

