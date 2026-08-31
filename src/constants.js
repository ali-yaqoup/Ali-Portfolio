export const PROFILE = {
  name: 'Ali Yaqoub',
  fullName: 'Ali Derar Ali Yaqoub',
  shortName: 'Ali',
  title: 'Software Engineering Student',
  roles: [
    'Software Engineering Student',
    'Full Stack Developer',
    'UI/UX Enthusiast',
  ],
  headline:
    'Fourth-year Software Engineering student at An-Najah National University. I build useful, enjoyable digital products by combining solid engineering with thoughtful design.',
  location: 'Palestine — Salfeet',
  email: 'ali.yaqoub.software@gmail.com',
  phone: '+972 594 348 757',
  phoneHref: 'tel:+972594348757',
  github: 'https://github.com/ali-yaqoup',
  githubHandle: 'ali-yaqoup',
  linkedin: 'https://www.linkedin.com/in/ali-derar-5679a8292',
  linkedinHandle: 'Ali Derar',
  twitter: 'https://x.com/ali_yaqoub',
  university: 'An-Najah National University',
}

export const CV_HREF = `${import.meta.env.BASE_URL}Ali_Yaqoub_CV.pdf`
export const PROFILE_IMAGE = `${import.meta.env.BASE_URL}profile.jpeg`

export const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'internships', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
]

export const SECTION_IDS = ['home', ...NAV_LINKS.map((link) => link.id)]
