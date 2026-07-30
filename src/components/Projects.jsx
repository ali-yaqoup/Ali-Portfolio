import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Code, Sparkles, Filter, Grid, List } from 'lucide-react';
import projectsData from '../projects.json';

const Projects = () => {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [selectedTech, setSelectedTech] = useState(null);

  // استخراج كل التقنيات المستخدمة
  const projects = Array.isArray(projectsData) ? projectsData : projectsData.projects || [];
  const allTechs = [...new Set(projects.flatMap(p => p.technologies))].sort();
  
  // فلترة المشاريع
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'featured') return project.featured;
    if (selectedTech) return project.technologies.includes(selectedTech);
    return project.category === filter;
  });

  // تصنيفات المشاريع
  const categories = [
    { id: 'all', name: 'All Projects', icon: Sparkles },
    { id: 'featured', name: 'Featured', icon: Code },
    { id: 'fullstack', name: 'Full Stack', icon: Code },
    { id: 'frontend', name: 'Frontend', icon: Grid },
    { id: 'backend', name: 'Backend', icon: List },
    { id: 'testing', name: 'Testing', icon: Filter },
    { id: 'algorithms', name: 'Algorithms', icon: Code },
  ];

  return (
    <section id="projects" className="relative py-20 bg-gray-900 overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              Projects
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A selection of projects built with modern technologies
          </p>
        </motion.div>

        {/* شريط التصفية */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setFilter(cat.id);
                    setSelectedTech(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                    filter === cat.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </motion.button>
              );
            })}
          </div>

          {/* تغيير طريقة العرض */}
          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* فلترة التقنيات */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filter by tech:
          </span>
          {allTechs.slice(0, 10).map((tech) => (
            <motion.button
              key={tech}
              onClick={() => {
                setSelectedTech(selectedTech === tech ? null : tech);
                setFilter('all');
              }}
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 text-sm rounded-full transition ${
                selectedTech === tech
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tech}
            </motion.button>
          ))}
        </div>

        {/* شبكة المشاريع */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + filter + selectedTech}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'flex flex-col gap-4'
              }
            `}
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

        {/* زر عرض المزيد */}
        {visibleProjects < filteredProjects.length && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={() => setVisibleProjects(prev => prev + 3)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition border border-gray-700 hover:border-indigo-500"
            >
              Load more projects
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// كرت المشروع المحسن
const ProjectCard = ({ project, index, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ x: 10 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-400 mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mr-4">
            <a href={project.github} target="_blank" rel="noopener noreferrer" 
               className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <Github className="w-5 h-5 text-gray-300" />
            </a>
            <a href={project.demo} target="_blank" rel="noopener noreferrer"
               className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all"
    >
      {/* صورة المشروع */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
        
        {/* شارة Featured */}
        {project.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}
        
        {/* روابط المشروع - تظهر عند التحويم */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute inset-0 bg-black/70 flex items-center justify-center gap-4"
        >
          <a href={project.github} target="_blank" rel="noopener noreferrer"
             className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transform hover:scale-110 transition">
            <Github className="w-6 h-6 text-white" />
          </a>
          <a href={project.demo} target="_blank" rel="noopener noreferrer"
             className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-full transform hover:scale-110 transition">
            <ExternalLink className="w-6 h-6 text-white" />
          </a>
        </motion.div>
      </div>

      {/* محتوى الكرت */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        {/* التقنيات */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span key={tech} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;