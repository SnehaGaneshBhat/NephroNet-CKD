import React from 'react';
import { Users, Heart, Award } from 'lucide-react';

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    designation: "Chief Medical Officer & Nephrologist",
    icon: <Heart className="h-12 w-12" style={{ color: '#4E3B53' }} />,
  },
  {
    name: "Prof. Michael Roberts", 
    designation: "Head of AI Research & Data Science",
    icon: <Award className="h-12 w-12" style={{ color: '#4E3B53' }} />,
  },
  {
    name: "Dr. Emily Watson",
    designation: "Clinical Director & Patient Care Specialist", 
    icon: <Users className="h-12 w-12" style={{ color: '#4E3B53' }} />,
  },
];

const MeetTheTeam = () => {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: '#CCC3EB' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Meet Our Team
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Dedicated experts committed to advancing kidney healthcare
          </p>
        </div>

        {/* Side-by-side layout with individual cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-xl p-8 w-80 flex-shrink-0 border border-purple-200"
            >
              {/* Centered icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full" style={{ backgroundColor: '#CCC3EB' }}>
                  {member.icon}
                </div>
              </div>
              
              {/* Name and designation */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#4E3B53' }}>
                  {member.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.designation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
