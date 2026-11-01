import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User } from '../types';
import { SkillTag } from '../components/SkillTag';
import { InviteModal } from '../components/InviteModal';
import {
  Search,
  Filter,
  UserPlus,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Loader2,
  FileText,
  ExternalLink,
} from 'lucide-react';

const ROLES = [
  'All',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'DevOps/Cloud',
  'Product Manager',
  'Data Scientist',
];

export const FindTeammatesPage: React.FC = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  // Invite Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter !== 'All') params.role = roleFilter;
      if (skillFilter) params.skill = skillFilter;
      if (collegeFilter) params.college = collegeFilter;

      const res = await api.get('/users', { params });
      if (res.data && res.data.success) {
        setStudents(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, skillFilter, collegeFilter]);

  const handleOpenInvite = (student: User) => {
    setSelectedStudent(student);
    setInviteModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Teammates
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect with top collegiate hackers, designers, and engineers based on complementary skills
        </p>
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
              placeholder="Search by student name, bio, or skills..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-700"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  Role: {r}
                </option>
              ))}
            </select>
          </div>

          {/* College Filter */}
          <div>
            <input
              type="text"
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              placeholder="Filter by university..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Skill tag filter quick-fill */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pl-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Popular Skills:
          </span>
          {['React', 'TypeScript', 'Python', 'PyTorch', 'Figma', 'Solidity', 'Go', 'Flutter'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setSkillFilter(skillFilter === s ? '' : s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  skillFilter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {s}
              </button>
            )
          )}
          {skillFilter && (
            <button
              onClick={() => setSkillFilter('')}
              className="text-xs text-rose-600 font-semibold pl-2 hover:underline"
            >
              Clear skill
            </button>
          )}
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Finding talented students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No students found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1"
            >
              {/* Header: Avatar, Name, College */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xl shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        <Link to={`/teammates/${student._id}`}>{student.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[170px]">{student.college}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5" />
                  {student.preferredRole}
                </div>

                {/* Bio Snippet */}
                {student.bio ? (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {student.bio}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No bio provided yet.</p>
                )}

                {/* Skills tags */}
                {student.skills && student.skills.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.slice(0, 4).map((skill) => (
                        <SkillTag key={skill} label={skill} size="sm" />
                      ))}
                      {student.skills.length > 4 && (
                        <span className="text-[11px] font-medium text-slate-400 self-center">
                          +{student.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Social Icons & Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  {student.githubUrl && (
                    <a
                      href={student.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:text-slate-900 transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {student.linkedinUrl && (
                    <a
                      href={student.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:text-blue-600 transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {student.portfolioUrl && (
                    <a
                      href={student.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:text-indigo-600 transition-colors"
                      title="Portfolio Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {student.resume && (
                    <a
                      href={student.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:text-indigo-600 transition-colors"
                      title="View Resume"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/teammates/${student._id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    Profile
                  </Link>
                  {isAuthenticated && currentUser?._id !== student._id && (
                    <button
                      type="button"
                      onClick={() => handleOpenInvite(student)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        targetUser={selectedStudent}
      />
    </div>
  );
};

