import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-acedemic.jpg'; 

import AuthNavbar from '../components/AuthNavbar';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: (
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#50C878]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.5-3.885 9.38 9.38 0 00-2.5-3.885m-6 7.77a9.38 9.38 0 01-2.5-3.885 9.38 9.38 0 012.5-3.885m-6 7.77a9.38 9.38 0 002.5-3.885 9.38 9.38 0 00-2.5-3.885M12 12a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
      ),
      title: 'For Students',
      description: 'Easily submit proposals, track progress, receive feedback, and manage your thesis or project from start to finish. Stay organized and never miss a deadline.',
      highlights: ['Smart Proposal System', 'Progress Tracking', 'Peer Collaboration', 'Real-time Feedback']
    },
    {
      icon: (
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#50C878]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
          </svg>
        </div>
      ),
      title: 'For Supervisors',
      description: 'Oversee multiple student projects, provide timely feedback, approve milestones, and manage your advisees efficiently. Centralized access to all necessary information.',
      highlights: ['Multi-student Dashboard', 'Research Oversight', 'Instant Communication', 'Progress Analytics']
    },
    {
      icon: (
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#50C878]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.653-.146-1.28-.42-1.857M2 20v-2c0-.653.146-1.28.42-1.857M12 12a3 3 0 100-6 3 3 0 000 6zm-9 6a3 3 0 100-6 3 3 0 000 6zm18 0a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
      ),
      title: 'For Committee Members',
      description: 'Access all project proposals, review student progress, and manage research cell assignments with ease. Ensure academic standards are met efficiently.',
      highlights: ['Research Cell Management', 'Quality Assurance', 'Supervisor Assignment', 'Academic Standards']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Navigation */}
      <AuthNavbar />

      {/* Hero Section */}
      <section 
  className="relative bg-cover bg-center py-20 lg:py-32 bg-blend-overlay" 
  style={{ backgroundImage: "url('/home-back.jpg')" }}
>
  {/* Balanced gradient and dark overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#1a8c3a]/80 to-[#1a8c3a]/10 bg-black/25  z-0"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
    <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 ease-out`}>
      <div className="space-y-6">
        <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight [text-shadow:0_2px_5px_rgba(0,0,0,0.6)]">
          Revolutionize Your
          <span className="text-[#fffed1]"> Academic Journey</span>
        </h1>

        <p className="text-lg lg:text-xl text-white max-w-3xl mx-auto [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
          ThesPro empowers students, supervisors, and committee members with cutting-edge tools 
          for seamless thesis and project management.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#50C878] bg-white hover:bg-gray-100 shadow-lg transition-all duration-300 flex items-center justify-center">
          New students? Please 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </Link>

        <Link to="/register" className="px-8 py-3 border border-white/50 text-base font-medium rounded-md text-white bg-[#A8E6A3]/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
          Register
        </Link>
      </div>
    </div>
  </div>
</section>




      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Built for Every Academic Role
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ThesPro provides specialized tools and dashboards tailored for students, supervisors, 
              and committee members to excel in their academic responsibilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-center h-16 w-16 bg-[#50C878]/20 rounded-full mb-6">
                  {feature.icon}
                </div>
                
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>

                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-sm text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#50C878] flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#50C878]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Academic Experience?
            </h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Join thousands of students and educators who trust ThesPro for their academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#50C878] bg-white hover:bg-gray-50 shadow-lg transition-all duration-300 flex items-center justify-center">
                Start Your Journey
              </Link>
              <Link to="/contact" className="px-8 py-3 border border-white border-opacity-50 text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#50C878] rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.172L21 21l-9.875-9.875M11.42 15.172a2.5 2.5 0 11-4.005-3.32A2.5 2.5 0 0111.42 15.172z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">ThesPro</span>
              </div>
              <p className="text-gray-400">
                Empowering academic excellence through innovative thesis and project management.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-500">
            <p>&copy; 2025 ThesPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;