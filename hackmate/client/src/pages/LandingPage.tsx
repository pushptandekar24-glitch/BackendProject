import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import { Hackathon } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';

export const LandingPage: React.FC = () => {
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/hackathons?limit=3');
        if (res.data && res.data.success) {
          setFeaturedHackathons(res.data.hackathons);
        }
      } catch (err) {
        console.error('Error fetching featured hackathons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-purple-100/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            The Collegiate Hackathon Network
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Find your people.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              Build something brilliant.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            HackMate matches ambitious college developers, designers, and thinkers to form
            winning hackathon squads. No more random teaming or missed deadlines.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/hackathons"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200/60 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Explore Hackathons
            </Link>
            <Link
              to="/teammates"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200/90 shadow-subtle transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-indigo-600" />
              Find Teammates
            </Link>
          </div>

          {/* Social Proof / Stats Strip */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">50+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Collegiate Hackathons</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,200+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Student Builders</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">380+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Teams Formed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">$250k+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Prize Pools Listed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hackathons Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
              <Flame className="w-4 h-4" />
              Upcoming Competitions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Hackathons
            </h2>
          </div>
          <Link
            to="/hackathons"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all hackathons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse p-6"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons.map((h) => (
              <div
                key={h._id}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Banner Thumbnail */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      h.bannerUrl ||
                      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={h.mode} />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {h.prizePool}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      {h.theme}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {h.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {h.tagline || h.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(h.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {h.location}
                      </span>
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

                    <Link
                      to={`/hackathons/${h._id}`}
                      className="mt-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold text-center border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
                    >
                      View Hackathon & Teams <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              How HackMate Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Turn your individual hackathon ideas into functional, award-winning submissions with the right crew.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Discover Hackathons</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter competitions by theme, format (online or in-person), prize pool, and required tech stack.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 font-extrabold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Showcase Your Skills</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Craft a verified student builder profile highlighting your college, GitHub, resume, and role specialties.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-extrabold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Assemble Your Team</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create a squad listing, send direct invitations, and manage your team roster seamlessly in one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-indigo-950 to-slate-900 p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to build your next championship project?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join collegiate builders from MIT, Stanford, Berkeley, Georgia Tech, and beyond. Free forever for students.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all hover:scale-105 active:scale-100 shadow-md shadow-indigo-900"
            >
              Create Free Account
            </Link>
            <Link
              to="/hackathons"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

