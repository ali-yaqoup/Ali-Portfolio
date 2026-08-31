import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Sparkles, Filter, Grid, List } from 'lucide-react';
import SectionHeading from './SectionHeading';
import projectsData from '../projects.json';

const hasRealLink = (url) => Boolean(url) && url !== '#';

const projectImage = (src) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
};

const Projects = () => {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [selectedTech, setSelectedTech] = useState(null);

  const projects = Array.isArray(projectsData) ? projectsData : projectsData.projects || [];
  const allTechs = [...new Set(projects.flatMap((p) => p.technologies))].sort();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (selectedTech && !project.technologies.includes(selectedTech)) return false;
      if (filter === 'all') return true;
      if (filter === 'featured') return project.featured;
      return project.category === filter;
    });
  }, [projects, filter, selectedTech]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'featured', name: 'Featured' },
    { id: 'fullstack', name: 'Full Stack' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'testing', name: 'Testing' },
    { id: 'algorithms', name: 'Algorithms' },
  ];

  return (
    <section id="projects" className="relative py-24 overflow-hidden section-gradient">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionHeading
          kicker="Selected work"
          icon={Sparkles}
          title="Featured"
          accent="Projects"
          subtitle="A mix of full-stack products, APIs, mobile apps, and course work."
        />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setFilter(cat.id);
                  setVisibleProjects(6);
                }}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  filter === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Tech:
          </span>
          {allTechs.slice(0, 12).map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => {
                setSelectedTech(selectedTech === tech ? null : tech);
                setVisibleProjects(6);
              }}
              className={`px-3 py-1 text-sm rounded-full transition ${
                selectedTech === tech
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${filter}-${selectedTech}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProjects.slice(0, visibleProjects).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <p className="text-center text-slate-400 mt-10">No projects match this filter yet.</p>
        )}

        {visibleProjects < filteredProjects.length && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => setVisibleProjects((prev) => prev + 3)}
              className="px-8 py-3 glass rounded-full font-semibold hover:border-indigo-400/50 transition"
            >
              Load more projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const ProjectLinks = ({ project, compact = false }) => (
  <div className={`flex gap-3 ${compact ? '' : ''}`}>
    {hasRealLink(project.github) && (
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} GitHub`}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
      >
        <Github className="w-5 h-5 text-white" />
      </a>
    )}
    {hasRealLink(project.demo) && (
      <a
        href={project.demo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} live demo`}
        className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
      >
        <ExternalLink className="w-5 h-5 text-white" />
      </a>
    )}
  </div>
);

const ProjectCard = ({ project, index, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className="glass rounded-xl p-6 hover:border-indigo-400/40 transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{project.title}</h3>
              {project.featured && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Featured</span>
              )}
            </div>
            <p className="text-slate-400 mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 5).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-white/5 text-slate-300 text-xs rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <ProjectLinks project={project} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative glass rounded-xl overflow-hidden hover:border-indigo-400/40 transition-all hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={projectImage(project.image)}
          alt=""
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070712] to-transparent opacity-70" />
        {project.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <ProjectLinks project={project} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition">
          {project.title}
        </h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 5).map((tech) => (
            <span key={tech} className="px-2 py-1 bg-white/5 text-slate-300 text-xs rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;
