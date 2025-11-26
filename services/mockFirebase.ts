import { UserProfile, Post, UserRole, Comment, Message, Institution, OnboardingRequest } from '../types';

// --- Mock Data Store ---

let MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'inst_nfsu',
    name: 'NFSU Social',
    code: 'NFSU',
    logo: 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png',
    description: 'National Forensic Sciences University',
    themeColor: '#FF725E'
  },
  {
    id: 'inst_iit',
    name: 'IIT Delhi Connect',
    code: 'IITD',
    logo: 'https://cdn-icons-png.flaticon.com/512/2997/2997274.png',
    description: 'Indian Institute of Technology Delhi',
    themeColor: '#6C63FF'
  }
];

let MOCK_REQUESTS: OnboardingRequest[] = [
  {
    id: 'req_demo_1',
    instituteName: 'Stanford University',
    email: 'admin@stanford.edu',
    contactName: 'John Dean',
    status: 'PENDING'
  }
];

let MOCK_USERS: UserProfile[] = [
  {
    uid: 'super_admin',
    institutionId: 'squadran',
    name: 'Squadran CEO',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=CEO',
    blocked: false
  },
  // NFSU Users
  {
    uid: 'student_01',
    institutionId: 'inst_nfsu',
    name: 'Rohan Sharma',
    email: 'rohan@nfsu.ac.in',
    role: UserRole.STUDENT,
    batch: '2023-2025',
    avatar: 'https://picsum.photos/seed/student1/200',
    bio: 'Aspiring Cyber Security Analyst.',
    blocked: false
  },
  {
    uid: 'admin_nfsu',
    institutionId: 'inst_nfsu',
    name: 'NFSU Admin',
    role: UserRole.INSTITUTION_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin',
    blocked: false
  },
  // IIT Users
  {
    uid: 'student_iit_1',
    institutionId: 'inst_iit',
    name: 'Vikram Singh',
    email: 'vikram@iitd.ac.in',
    role: UserRole.STUDENT,
    batch: '2022-2026',
    avatar: 'https://picsum.photos/seed/iit1/200',
    bio: 'CS Undergrad.',
    blocked: false
  },
  {
    uid: 'admin_iit',
    institutionId: 'inst_iit',
    name: 'IIT Admin',
    role: UserRole.INSTITUTION_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin',
    blocked: false
  }
];

let MOCK_POSTS: Post[] = [
  {
    id: 'post_nfsu_1',
    institutionId: 'inst_nfsu',
    authorId: 'admin_nfsu',
    authorName: 'NFSU Admin',
    authorRole: UserRole.INSTITUTION_ADMIN,
    title: 'Forensic Conf 2025',
    content: 'Join us for the conference.',
    timestamp: Date.now() - 100000,
    likes: 150,
    comments: [],
    status: 'VERIFIED',
    type: 'EVENTS'
  },
  {
    id: 'post_iit_1',
    institutionId: 'inst_iit',
    authorId: 'student_iit_1',
    authorName: 'Vikram Singh',
    authorRole: UserRole.STUDENT,
    content: 'Robotics club meet at 5 PM.',
    timestamp: Date.now() - 50000,
    likes: 20,
    comments: [],
    status: 'VERIFIED',
    type: 'NEWSLETTER'
  }
];

let MOCK_MESSAGES: Message[] = [];

// --- Service Methods ---

export const db = {
  // --- Squadran Super Admin ---
  loginSuperAdmin: (password: string): boolean => {
    // ACCESS CODE: squadran_root
    return password === 'squadran_root';
  },

  getInstitutions: (): Institution[] => MOCK_INSTITUTIONS,

  getInstitutionByCode: (code: string): Institution | undefined => {
    return MOCK_INSTITUTIONS.find(i => i.code.trim().toUpperCase() === code.trim().toUpperCase());
  },

  createInstitution: (name: string, code: string, logo: string, desc: string, themeColor: string = '#4AA4F2'): Institution => {
    const newInst: Institution = {
      id: `inst_${Date.now()}`,
      name,
      code,
      logo: logo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      description: desc,
      themeColor: themeColor
    };
    MOCK_INSTITUTIONS.push(newInst);
    
    // Create a default admin for this institution automatically
    MOCK_USERS.push({
      uid: `admin_${newInst.id}`,
      institutionId: newInst.id,
      name: `${code} Admin`,
      role: UserRole.INSTITUTION_ADMIN,
      avatar: `https://ui-avatars.com/api/?name=${code}+Admin`,
      blocked: false
    });

    // Create a welcome post
    db.createPost({
      institutionId: newInst.id,
      authorId: `admin_${newInst.id}`,
      authorName: `${code} Admin`,
      authorRole: UserRole.INSTITUTION_ADMIN,
      title: `Welcome to ${name}`,
      content: `Welcome to the official ${name} social platform powered by Squadran.`,
      type: 'NEWSLETTER'
    });

    // Verify that welcome post immediately
    const p = MOCK_POSTS[0];
    if(p) p.status = 'VERIFIED';

    return newInst;
  },

  deleteInstitution: (instId: string): void => {
    MOCK_INSTITUTIONS = MOCK_INSTITUTIONS.filter(i => i.id !== instId);
    // Cleanup users and posts associated with it
    MOCK_USERS = MOCK_USERS.filter(u => u.institutionId !== instId);
    MOCK_POSTS = MOCK_POSTS.filter(p => p.institutionId !== instId);
  },

  // Onboarding Requests
  submitOnboardingRequest: (instituteName: string, email: string, contactName: string): void => {
    MOCK_REQUESTS.push({
      id: `req_${Date.now()}`,
      instituteName,
      email,
      contactName,
      status: 'PENDING'
    });
  },

  getOnboardingRequests: (): OnboardingRequest[] => MOCK_REQUESTS.filter(r => r.status === 'PENDING'),

  approveRequest: (requestId: string): void => {
    const req = MOCK_REQUESTS.find(r => r.id === requestId);
    if (req) {
      req.status = 'APPROVED';
      // Auto-create the institution with a random color
      const colors = ['#FF725E', '#4AA4F2', '#6C63FF', '#43D9AD', '#FFC75F'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      db.createInstitution(
        req.instituteName, 
        req.instituteName.substring(0, 4).toUpperCase(), 
        '', 
        'Partner Institution', 
        randomColor
      );
    }
  },

  // --- Auth (Scoped to Institution) ---
  loginStudent: (email: string, institutionId: string): { user: UserProfile | null, error?: string } => {
    const user = MOCK_USERS.find(u => u.role === UserRole.STUDENT && u.email === email && u.institutionId === institutionId);
    if (user) {
      if (user.blocked) return { user: null, error: "Access Denied: Blocked." };
      return { user };
    }
    return { user: null };
  },

  loginAlumni: (rollNo: string, institutionId: string): { user: UserProfile | null, error?: string } => {
    const user = MOCK_USERS.find(u => u.role === UserRole.ALUMNI && u.rollNo === rollNo && u.institutionId === institutionId);
    if (user) {
      if (user.blocked) return { user: null, error: "Access Denied: Blocked." };
      return { user };
    }
    return { user: null };
  },

  loginInstAdmin: (password: string, institutionId: string): { user: UserProfile | null, error?: string } => {
     // For mock purposes, using a generic 'admin' password
     if (password === 'admin') {
         const user = MOCK_USERS.find(u => u.role === UserRole.INSTITUTION_ADMIN && u.institutionId === institutionId);
         if (user) return { user };
         // If user doesn't exist (rare case), create temp admin
         return { user: null, error: "Admin account configuration error." };
     }
     return { user: null, error: "Invalid Admin Credentials" };
  },

  // Signup
  signupStudent: (institutionId: string, name: string, email: string, batch: string): UserProfile => {
    const newUser: UserProfile = {
      uid: `student_${Date.now()}`,
      institutionId,
      name,
      email,
      role: UserRole.STUDENT,
      batch,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      bio: 'Student',
      blocked: false
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },

  signupAlumni: (institutionId: string, name: string, rollNo: string, batch: string, bio: string): UserProfile => {
    const newUser: UserProfile = {
      uid: `alumni_${Date.now()}`,
      institutionId,
      name,
      rollNo,
      role: UserRole.ALUMNI,
      batch,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      bio: bio || 'Alumni',
      blocked: false
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },

  updateUser: (uid: string, data: Partial<UserProfile>): UserProfile | null => {
    const index = MOCK_USERS.findIndex(u => u.uid === uid);
    if (index !== -1) {
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
      return MOCK_USERS[index];
    }
    return null;
  },

  // --- Admin User Mgmt (Scoped) ---
  adminGetAllUsers: (institutionId: string): UserProfile[] => {
    return MOCK_USERS.filter(u => u.institutionId === institutionId && u.role !== UserRole.INSTITUTION_ADMIN && u.role !== UserRole.SUPER_ADMIN);
  },

  adminDeleteUser: (uid: string): void => {
    MOCK_USERS = MOCK_USERS.filter(u => u.uid !== uid);
  },

  adminToggleBlockUser: (uid: string): UserProfile | undefined => {
    const user = MOCK_USERS.find(u => u.uid === uid);
    if (user) {
      user.blocked = !user.blocked;
      return user;
    }
    return undefined;
  },

  // Networking (Scoped)
  getAllUsers: (currentUserId: string, institutionId: string): UserProfile[] => {
    return MOCK_USERS.filter(u => 
      u.institutionId === institutionId && 
      u.uid !== currentUserId && 
      u.role !== UserRole.INSTITUTION_ADMIN && 
      !u.blocked
    );
  },

  getUserById: (uid: string): UserProfile | undefined => {
    return MOCK_USERS.find(u => u.uid === uid);
  },

  // Posts (Scoped)
  getPosts: (institutionId: string, type: 'NEWSLETTER' | 'JOB' | 'EVENTS', onlyVerified: boolean = true): Post[] => {
    return MOCK_POSTS.filter(p => {
      const instMatch = p.institutionId === institutionId;
      const typeMatch = p.type === type;
      const statusMatch = onlyVerified ? p.status === 'VERIFIED' : true;
      return instMatch && typeMatch && statusMatch;
    }).sort((a, b) => b.timestamp - a.timestamp);
  },

  getPendingPosts: (institutionId: string): Post[] => {
    return MOCK_POSTS.filter(p => p.institutionId === institutionId && p.status === 'PENDING');
  },

  getUserPosts: (userId: string): Post[] => {
    return MOCK_POSTS.filter(p => p.authorId === userId).sort((a, b) => b.timestamp - a.timestamp);
  },

  createPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'status'>): void => {
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      timestamp: Date.now(),
      likes: 0,
      comments: [],
      status: 'PENDING'
    };
    MOCK_POSTS.unshift(newPost);
  },

  // Admin Actions
  verifyPost: (postId: string): void => {
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (post) post.status = 'VERIFIED';
  },

  updatePost: (postId: string, newContent: string): void => {
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (post) post.content = newContent;
  },

  deletePost: (postId: string): void => {
    MOCK_POSTS = MOCK_POSTS.filter(p => p.id !== postId);
  },

  toggleLike: (postId: string): void => {
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (post) post.likes += 1;
  },

  addComment: (postId: string, userId: string, userName: string, text: string): Comment => {
    const post = MOCK_POSTS.find(p => p.id === postId);
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId,
      userName,
      text,
      timestamp: Date.now()
    };
    if (post) {
      post.comments.push(newComment);
    }
    return newComment;
  },

  // Messaging (Global for simplicity, or filtered if needed)
  getMessages: (currentUserId: string, otherUserId: string): Message[] => {
    return MOCK_MESSAGES.filter(m => 
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  getConversations: (currentUserId: string): string[] => {
    const userIds = new Set<string>();
    MOCK_MESSAGES.forEach(m => {
      if (m.senderId === currentUserId) userIds.add(m.receiverId);
      if (m.receiverId === currentUserId) userIds.add(m.senderId);
    });
    return Array.from(userIds);
  },

  sendMessage: (senderId: string, receiverId: string, text: string): void => {
    MOCK_MESSAGES.push({
      id: `m_${Date.now()}`,
      senderId,
      receiverId,
      text,
      timestamp: Date.now(),
      read: false
    });
  }
};