import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FolderGit2, Award, Briefcase, GraduationCap } from 'lucide-react';
import { CV_HREF, PROFILE, PROFILE_IMAGE } from '../constants';
import projectsData from '../projects.json';
import certificationsData from '../certifications.json';
import internshipsData from '../internships.json';

const About = () => {
  const [imageSrc, setImageSrc] = useState(PROFILE_IMAGE);
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const stats = [
    { icon: FolderGit2, value: `${projects.length}+`, label: 'Projects' },
    { icon: Briefcase, value: `${internshipsData.length}`, label: internshipsData.length === 1 ? 'Internship' : 'Internships' },
    { icon: Award, value: `${certificationsData.length}`, label: 'Certificates' },
    { icon: GraduationCap, value: '4th', label: 'Year student' },
  ];

  return (
    <section id="about" className="relative py-24 overflow-hidden section-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center gap-14"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden ring-4 ring-indigo-500/40 ring-offset-4 ring-offset-[#070712]"
            >
              <img
                src={imageSrc}
                alt={PROFILE.name}
                className="w-full h-full object-cover"
                onError={() => setImageSrc('')}
              />
              {!imageSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-500 text-5xl font-bold">
                  AY
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <p className="text-indigo-300 font-medium mb-3">About me</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {PROFILE.shortName}{' '}
              <span className="text-gradient">Yaqoub</span>
            </h2>

            <p className="text-xl text-slate-300 mb-6">
              Software Engineering Student · Full Stack Developer · UI/UX Enthusiast
            </p>

            <p className="text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              I'm {PROFILE.fullName}, a fourth-year Software Engineering student at {PROFILE.university}.
              I enjoy turning messy problems into clean products — from Laravel APIs and React interfaces
              to mobile marketplaces and thoughtful UI. I care about code that holds up, and experiences
              people actually like using.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="glass rounded-2xl p-4 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              <span className="px-3 py-1 rounded-full glass text-sm text-slate-300">Arabic — Native</span>
              <span className="px-3 py-1 rounded-full glass text-sm text-slate-300">English — Professional</span>
              <span className="px-3 py-1 rounded-full glass text-sm text-slate-300">{PROFILE.location}</span>
            </div>

            <a
              href={CV_HREF}
              download="Ali_Yaqoub_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              Download CV
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
