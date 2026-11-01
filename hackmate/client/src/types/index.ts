export interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  bio?: string;
  avatar?: string;
  resume?: string;
  preferredRole: string;
  skills: string[];
  interests: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hackathon {
  _id: string;
  title: string;
  tagline?: string;
  description: string;
  theme: string;
  mode: 'Online' | 'In-Person' | 'Hybrid';
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizePool: string;
  minTeamSize: number;
  maxTeamSize: number;
  skillsRequired: string[];
  websiteUrl?: string;
  bannerUrl?: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    college?: string;
  };
  teamsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  hackathon: {
    _id: string;
    title: string;
    theme: string;
    mode: string;
    startDate: string;
    endDate: string;
    bannerUrl?: string;
    maxTeamSize?: number;
  };
  leader: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    college?: string;
    preferredRole?: string;
    skills?: string[];
    bio?: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    college?: string;
    preferredRole?: string;
    skills?: string[];
  }>;
  requiredSkills: string[];
  maxMembers: number;
  status: 'Open' | 'Full' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  _id: string;
  team: {
    _id: string;
    name: string;
    description?: string;
    requiredSkills?: string[];
    members?: any[];
    maxMembers?: number;
  };
  hackathon: {
    _id: string;
    title: string;
    theme: string;
    mode: string;
    startDate?: string;
    endDate?: string;
    bannerUrl?: string;
  };
  sender: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
    college?: string;
    preferredRole?: string;
  };
  receiver: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
    college?: string;
    preferredRole?: string;
    skills?: string[];
  };
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  stats: {
    myTeamsCount: number;
    pendingInvitesCount: number;
    upcomingHackathonsCount: number;
  };
  myTeams: Team[];
  pendingInvitations: Invitation[];
  recommendedHackathons: Hackathon[];
  suggestedTeammates: User[];
}

