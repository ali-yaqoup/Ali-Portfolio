import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'ali.yaqoub.software@gmail.com',
      href: 'mailto:ali.yaqoub.software@gmail.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+972 594 348 757',
      href: 'tel:+972594348757'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Palestine - Salfeet',
      href: null
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'Ali Derar',
      href: 'https://www.linkedin.com/in/ali-derar-5679a8292'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'ali-yaqoup',
      href: 'https://github.com/ali-yaqoup'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 text-center">Get In Touch</h2>
          <div className="w-20 h-1 mx-auto rounded bg-gradient-to-r from-indigo-600 to-purple-600 mb-12" />
          
          <div className="grid md:grid-cols-2 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div 
                  key={index}
                  className="glass rounded-lg p-6 hover:border-indigo-500 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-6 h-6 text-indigo-500" />
                    <div>
                      <p className="text-gray-400 text-sm">{info.label}</p>
                      {info.href ? (
                        <a 
                          href={info.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold hover:text-indigo-400 transition-colors"
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
        </motion.div>
      </div>
    </section>
  );
}