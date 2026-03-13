import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

const ReportAnalysis = ({ onUpload, isUploading, file, setFile }) => {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadClick = () => {
    if (file && onUpload) {
      onUpload();
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background with tech gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700">
        {/* Tech grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}></div>
        </div>
        
        {/* Animated neon glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(147, 51, 234, 0.2) 100%)',
              'linear-gradient(90deg, rgba(236, 72, 153, 0.2) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
              'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(147, 51, 234, 0.2) 100%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Analyze Your Medical Report
          </h2>
          <p className="text-xl text-purple-100 font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Upload your PDF report for comprehensive AI-powered analysis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-white/20"
        >
          <div className="border-4 border-dashed border-purple-300/50 rounded-2xl p-12 text-center hover:border-purple-400/70 transition-all duration-300 relative overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-10 w-10 text-white" />
              </div>
              
              <h3 
                className="text-2xl font-bold mb-4 text-white"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Upload Your Medical Report
              </h3>
              <p className="text-purple-100 mb-6 font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Drag and drop your PDF file here, or click to browse
              </p>
              
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-8 py-4 rounded-full font-semibold cursor-pointer transition-all transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/50"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Choose PDF File
              </label>
              
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">{file.name}</span>
                </motion.div>
              )}
            </div>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="px-12 py-4 rounded-full font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-purple-500/50"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {isUploading ? 'Analyzing...' : 'Analyze Report'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ReportAnalysis;
