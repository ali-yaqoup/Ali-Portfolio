import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Camera, Check, Edit2 } from 'lucide-react';
import profileImg from '/profile.jpeg'; // الصورة الافتراضية

const About = () => {
  const [profileImage, setProfileImage] = useState(profileImg);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // تحميل الصورة من LocalStorage عند بدء التشغيل
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // دالة تغيير الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
        
        // إظهار رسالة النجاح
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="about" className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-900 via-[#0a0f3d] to-[#141b6b]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          {/* صورة البروفايل - مع تأثيرات تفاعلية */}
          <div className="relative group">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden ring-4 ring-indigo-500/50 ring-offset-4 ring-offset-gray-900"
            >
              <img 
                src={profileImage} 
                alt="Ali Yaqoub" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay عند التحويم */}
              <div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full transition-all transform hover:scale-110">
                  <Camera className="w-6 h-6" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </motion.div>

            {/* Badge النجاح */}
            {showUploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Photo updated successfully
              </motion.div>
            )}
          </div>

          {/* باقي محتوى الـ About */}
          <div className="flex-1 text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Ali{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                Yaqoub
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-6"
            >
              Software Engineering Student • Full Stack Developer • UI/UX Enthusiast
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0"
            >
              I'm Ali Derar Ali Yaqoub, a fourth-year Software Engineering student at An-Najah National University. I'm passionate about technology and enjoy solving problems through logical thinking and creativity. I aim to become a programmer who combines technical skills with creativity to build digital solutions that are both useful and enjoyable to use. My expertise spans full-stack development, modern web technologies, and UI/UX design.
            </motion.p>

            {/* CV Download Button */}
            <motion.a
              href={`${import.meta.env.BASE_URL}Ali_Yaqoub_CV.pdf`}
              download="Ali_Yaqoub_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 group"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Download CV
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;