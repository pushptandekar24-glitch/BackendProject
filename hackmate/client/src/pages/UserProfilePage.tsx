import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Team } from '../types';
import { SkillTag } from '../components/SkillTag';
import { StatusBadge } from '../components/StatusBadge';
import { InviteModal } from '../components/InviteModal';
import {
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  FileText,
  UserPlus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Layers,
  Calendar,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [student, setStudent] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        if (res.data && res.data.success) {
          setStudent(res.data.user);
          setTeams(res.data.teams || []);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Student not found'}</h2>
        <Link
          to="/teammates"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teammate Search
        </Link>
      </div>
    );
  }

  const isSelf = currentUser?._id === student._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/teammates"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-200 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-50 text-indigo-700 font-black text-3xl flex items-center justify-center border-2 border-indigo-100 shadow-md flex-shrink-0">
              {student.name.charAt(0)}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {student.name}
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              {student.college}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              {student.preferredRole}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isSelf ? (
            <Link
              to="/profile"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
            >
              Edit Your Profile
            </Link>
          ) : (
            isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsInviteOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Invite to Team
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid: Bio & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Bio & Teams */}
        <div className="md:col-span-2 space-y-8">
          {/* Bio Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About {student.name}</h2>
            {student.bio ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {student.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No bio written yet.</p>
            )}
          </div>

          {/* Teams participating in */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Active Teams ({teams.length})
            </h2>

            {teams.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Not currently listed in any public teams.</p>
            ) : (
              <div className="space-y-3">
                {teams.map((t) => (
                  <div
                    key={t._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                      <p className="text-xs text-indigo-600">{t.hackathon?.title}</p>
                    </div>
                    <Link
                      to={`/teams/${t._id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View Team →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skills, Interests & Links */}
        <div className="space-y-6">
          {/* Skills & Interests Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {student.skills && student.skills.length > 0 ? (
                  student.skills.map((skill) => (
                    <SkillTag key={skill} label={skill} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No skills listed yet</span>
                )}
              </div>
            </div>

            {student.interests && student.interests.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Interests & Domains
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {student.interests.map((interest) => (
                    <SkillTag key={interest} label={interest} size="sm" variant="violet" />
                  ))}
                </div>
              </div>
            )}

            {/* Links & Resume */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Profiles & Documents
              </h3>
              <div className="space-y-2 text-xs">
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Github className="w-4 h-4 text-slate-500" />
                    <span className="truncate">GitHub Profile</span>
                  </a>
                )}
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-500" />
                    <span className="truncate">LinkedIn Profile</span>
                  </a>
                )}
                {student.portfolioUrl && (
                  <a
                    href={student.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">Portfolio Website</span>
                  </a>
                )}
                {student.resume && (
                  <a
                    href={student.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Student Resume (PDF)</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        targetUser={student}
      />
    </div>
  );
};

