import AnimatedSection, { StaggerChildren } from './AnimatedSection'
import SectionHeading from './SectionHeading'
import skillsData from '../skills.json'
import { Sparkles } from 'lucide-react'

export default function Skills() {
  return (
    <section id="skills" className="py-24 section-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="My Toolbox"
            icon={Sparkles}
            title="Skills &"
            accent="Technologies"
          />
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
          {skillsData.map((category) => (
            <div
              key={category.title}
              className="glass rounded-2xl p-6 hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-white mb-5 pb-3 border-b border-white/10">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-slate-100 text-sm hover:bg-indigo-500/25 hover:text-white transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
