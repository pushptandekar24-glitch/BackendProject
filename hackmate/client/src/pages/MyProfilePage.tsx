import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { SkillTag } from '../components/SkillTag';
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Github,
  Linkedin,
  Globe,
  Save,
} from 'lucide-react';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'DevOps/Cloud',
  'Product Manager',
  'Data Scientist',
  'General Hacker',
];

export const MyProfilePage: React.FC = () => {
  const { user, refreshUser, setUser } = useAuth();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [preferredRole, setPreferredRole] = useState('Fullstack Developer');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // File Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Status message states
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setPreferredRole(user.preferredRole || 'Fullstack Developer');
      setBio(user.bio || '');
      setSkills(user.skills || []);
      setInterests(user.interests || []);
      setGithubUrl(user.githubUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setPortfolioUrl(user.portfolioUrl || '');
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Profile photo must be less than 5MB.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMsg('Resume must be a PDF file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Resume must be less than 5MB.');
        return;
      }
      setResumeFile(file);
      setErrorMsg(null);
    }
  };

  const handleUploadFiles = async () => {
    if (!avatarFile && !resumeFile) return;

    setUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);

    const formData = new FormData();
    if (avatarFile) formData.append('avatar', avatarFile);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      const res = await api.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Files uploaded and attached to profile!');
        setUser(res.data.user);
        setAvatarFile(null);
        setResumeFile(null);
        setTimeout(() => setUploadProgress(null), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'File upload failed. Please try again.');
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. If files were selected, upload them first
      if (avatarFile || resumeFile) {
        await handleUploadFiles();
      }

      // 2. Save textual profile fields
      const res = await api.put('/users/profile', {
        name,
        college,
        preferredRole,
        bio,
        skills,
        interests,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      });

      if (res.data && res.data.success) {
        setUser(res.data.user);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize how other collegiate developers and organizers discover your talent
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Card 1: Avatar and Resume Uploads */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Profile Media & Resume</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-2xl flex items-center justify-center border-2 border-indigo-100 shadow-sm">
                    {name ? name.charAt(0) : 'U'}
                  </div>
                )}
                <label className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Profile Photo
                </label>
                <label className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                  Choose New Photo
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP (Max 5MB)</p>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student Resume (PDF)
              </label>

              {user?.resume && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-2">
                  <FileText className="w-4 h-4" />
                  <a
                    href={user.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline truncate max-w-[200px]"
                  >
                    View Current Resume
                  </a>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-600">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>{resumeFile ? resumeFile.name : 'Select PDF Resume'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400">PDF format only (Max 5MB)</p>
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-indigo-700">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Personal Details & Role */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Personal & Academic Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College or University
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Specialty / Role
              </label>
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-medium text-slate-800"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bio & Background
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about past hackathons, technologies you're excited about, and projects you've shipped..."
              maxLength={600}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 resize-none leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 float-right mt-1">
              {bio.length}/600 characters
            </span>
          </div>
        </div>

        {/* Card 3: Skills & Interests */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Skills & Tech Stack</h2>

          {/* Interactive Skills */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Technical Skills (Press Enter to add)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. React, Docker, PyTorch, GraphQL..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((s) => (
                <SkillTag key={s} label={s} onRemove={() => handleRemoveSkill(s)} size="md" />
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-slate-400 italic">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* Interactive Interests */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Interests & Domains (Press Enter to add)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleAddInterest}
                placeholder="e.g. AI Agents, Climate Tech, FinTech, Robotics..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {interests.map((i) => (
                <SkillTag
                  key={i}
                  label={i}
                  onRemove={() => handleRemoveInterest(i)}
                  size="md"
                  variant="violet"
                />
              ))}
              {interests.length === 0 && (
                <p className="text-xs text-slate-400 italic">No interests added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Social & Portfolio Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Online Presence</h2>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Linkedin className="w-4 h-4 text-blue-500" />
              </div>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Form Bottom Action */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200/60 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saving || uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

