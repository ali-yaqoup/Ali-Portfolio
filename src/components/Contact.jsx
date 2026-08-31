import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { PROFILE } from '../constants';

export default function Contact() {
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: PROFILE.phone,
      href: PROFILE.phoneHref,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: PROFILE.location,
      href: null,
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: PROFILE.linkedinHandle,
      href: PROFILE.linkedin,
    },
    {
      icon: Github,
      label: 'GitHub',
      value: PROFILE.githubHandle,
      href: PROFILE.github,
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    const subject = encodeURIComponent(`Portfolio message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    setStatus('sent');
  };

  return (
    <section id="contact" className="py-24 section-gradient">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          kicker="Let's talk"
          icon={Send}
          title="Get In"
          accent="Touch"
          subtitle="Have a role, a project, or a question? I usually reply within a day."
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.label}
                  className="glass rounded-2xl p-5 hover:border-indigo-400/40 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="text-white font-semibold hover:text-indigo-300 transition-colors break-all"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white font-semibold">{info.value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8 space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm text-slate-300 mb-2">Name</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-indigo-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-indigo-400"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm text-slate-300 mb-2">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-indigo-400 resize-y"
                placeholder="Tell me about the role or project"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Send size={18} />
              Send message
            </button>
            {status === 'sent' && (
              <p className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                Your email app should open with the message ready to send.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
