import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, Heart } from 'lucide-react';

const ResultsView = ({ results, onAnalyzeAnother }) => {
  // Debug: Log results to see what we're getting
  console.log('ResultsView received results:', results);
  console.log('Drug results:', results?.AgentB?.drug_results);
  
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
      {/* Background tech elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          animation: 'slide 20s linear infinite'
        }}></div>
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Your Analysis Results
          </h2>
          <p className="text-xl text-gray-600 font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Comprehensive insights from our specialized AI agents
          </p>
        </motion.div>

        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Agent A - CKD Risk Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl duration-300 relative overflow-hidden"
          >
            {/* Neon glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-3 bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  CKD Risk Assessment
                </h3>
              </div>
              <div className="space-y-6">
                {results.AgentA?.feedback?.map((fb, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 relative group">
                    {/* Enhanced neon glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {fb.includes("Error generating narrative") || fb.includes("404 models") ? (
                      <div>
                        <p className="text-gray-700 leading-relaxed font-light mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          Based on your lab results, your CKD risk assessment shows:
                        </p>
                        <div className="space-y-3">
                          {results.AgentA?.risk?.map((risk, riskIdx) => (
                            <div key={riskIdx} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${
                                risk === 0 ? 'bg-green-500' : 
                                risk === 1 ? 'bg-yellow-500' : 
                                risk === 2 ? 'bg-orange-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-lg text-gray-700 font-medium">
                                Risk Level: {risk === 0 ? 'Low' : risk === 1 ? 'Mild' : risk === 2 ? 'Moderate' : 'High'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-600 text-lg font-light mt-4">
                          Continue regular monitoring and maintain a healthy lifestyle. Consult your healthcare provider for personalized advice.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {fb.includes("CKD Risk Assessment Results") ? (
                          <div className="whitespace-pre-line text-gray-700 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {fb}
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{fb}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Agent B - Drug Risks */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl duration-300 relative overflow-hidden"
          >
            {/* Neon glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-3 bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Drug Risk Analysis
                </h3>
              </div>
              <div className="space-y-6">
                {results.AgentB?.drug_results?.map((drug, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 relative group">
                    {/* Enhanced neon glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-purple-900 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {drug.DrugName || 'Unknown Drug'}
                        </h4>
                        <p className="text-gray-600 text-lg font-light mt-2">
                          {drug.Notes || 'No notes available'}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 ml-4 ${
                        drug.RiskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        drug.RiskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        drug.RiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {drug.RiskLevel === 'Medium' ? 'Moderate' : drug.RiskLevel} Risk
                      </span>
                    </div>
                    {drug.AlternativeName && drug.AlternativeName !== "None" && (
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <p className="text-gray-600 text-lg font-light">
                          <span className="font-medium">Safer Alternative:</span> {drug.AlternativeName}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Agent C - Patient Handout */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl duration-300 relative overflow-hidden"
          >
            {/* Neon glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Patient Recommendations
                </h3>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 relative group">
                {/* Subtle lavender glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-lavender-400/20 to-purple-300/30 opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                {results.AgentC?.handout?.includes("Error generating narrative") || results.AgentC?.handout?.includes("404 models") ? (
                  <div>
                    <p className="text-gray-700 leading-relaxed font-light mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      Personalized Patient Recommendations
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-lg font-light">
                          Maintain a balanced diet low in sodium and processed foods
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-lg font-light">
                          Stay hydrated with adequate water intake
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-lg font-light">
                          Regular exercise and maintain healthy weight
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-lg font-light">
                          Attend regular check-ups with your healthcare provider
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-6 font-light">
                      Note: AI-generated recommendations are currently unavailable. Please consult your healthcare provider for personalized advice.
                    </p>
                  </div>
                ) : (
                  <div>
                    {results.AgentC?.handout?.includes("Personalized CKD Nutrition Plan") ? (
                      <div className="text-gray-700 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {results.AgentC.handout.split('\n').map((line, index) => {
                          // Check if line starts with a bullet point
                          if (line.trim().startsWith('•')) {
                            return (
                              <div key={index} className="flex items-start space-x-3 mb-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-600 text-lg font-light">{line.trim().substring(1).trim()}</p>
                              </div>
                            );
                          }
                          // Check if line is a header (contains colons and is short, or contains specific keywords)
                          else if ((line.includes(':') && line.length < 60) || 
                                   line.includes('Lab Analysis Summary') ||
                                   line.includes('Targeted Diet Plan') ||
                                   line.includes('General Kidney Health') ||
                                   line.includes('Cultural Dietary') ||
                                   line.includes('Important Notes') ||
                                   line.includes('Foods to Limit') ||
                                   line.includes('Foods to Emphasize') ||
                                   line.includes('Patient Profile') ||
                                   line.includes('Simple Diet Plan') ||
                                   line.includes('Personalized Nutrition')) {
                            return (
                              <h4 key={index} className="font-bold text-purple-900 mt-4 mb-3 text-lg">{line.trim()}</h4>
                            );
                          }
                          // Regular text line
                          else if (line.trim()) {
                            return (
                              <p key={index} className="text-gray-600 text-lg font-light mb-3">{line.trim()}</p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {results.AgentC.handout.split('\n').map((line, index) => {
                          // Check if line starts with a bullet point
                          if (line.trim().startsWith('•')) {
                            return (
                              <div key={index} className="flex items-start space-x-3 mb-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-600 text-lg font-light">{line.trim().substring(1).trim()}</p>
                              </div>
                            );
                          }
                          // Check if line is a header (contains colons and is short, or contains specific keywords)
                          else if ((line.includes(':') && line.length < 60) || 
                                   line.includes('Patient Education') ||
                                   line.includes('Kidney Health') ||
                                   line.includes('Important')) {
                            return (
                              <h4 key={index} className="font-bold text-purple-900 mt-4 mb-3 text-lg">{line.trim()}</h4>
                            );
                          }
                          // Regular text line
                          else if (line.trim()) {
                            return (
                              <p key={index} className="text-gray-600 text-lg font-light mb-3">{line.trim()}</p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <button
            onClick={onAnalyzeAnother}
            className="px-8 py-4 rounded-full text-xl font-semibold text-white transition-all transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-purple-500/50"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Analyze Another Report
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsView;
