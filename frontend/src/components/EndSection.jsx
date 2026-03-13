import React from 'react';
import { Heart, Mail, MessageSquare } from 'lucide-react';

const EndSection = () => {
  return (
    <footer 
      className="py-10 px-6 bg-[#4E3B53] text-white" 
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-7 w-7 text-white" fill="currentColor" />
            <span className="text-xl font-semibold tracking-wide text-white">
              NEPHRONET
            </span>
          </div>
          <p className="text-sm text-white">
            © 2024 NephroNet — Revolutionizing kidney care with AI-powered insights.
          </p>
        </div>

        {/* Contact & Feedback */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Contact */}
          <div className="bg-purple-900/40 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Mail className="h-5 w-5 text-white mr-2" />
              <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            </div>
            <ul className="space-y-2 text-sm text-white">
              <li>Email: contact@nephronet.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Medical Center Dr, Suite 100, Boston, MA 02115</li>
            </ul>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center mb-3">
              <MessageSquare className="h-5 w-5 text-purple-900 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900">Feedback</h3>
            </div>
            <p className="text-sm mb-4 text-white">
              We value your suggestions to improve our services.
            </p>
            <textarea
              placeholder="Tell us what you think"
              className="w-full border border-purple-300 rounded-md p-2 text-sm mb-4 bg-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
            />
            <button className="w-full bg-purple-900 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition">
              Submit Feedback
            </button>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="border-t border-white pt-6">
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <a href="#" className="hover:text-gray-200 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-200 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-200 transition">Contact Us</a>
            <a href="#" className="hover:text-gray-200 transition">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EndSection;