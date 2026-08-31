'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Users, MapPin, ChevronRight, Play, CheckCircle, Zap, Heart, MessageCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SPIN_PURPLE = '#7C3AED';
const SPIN_ORANGE = '#FFA500';
const SPIN_BLACK = '#000000';

// Placeholder data
const PLACEHOLDER_NEXT_SESSION = {
  text_title: 'Podcasting Group 1',
  dtl_start_local: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  teacher_name: 'Coach Jordan',
  location: 'In-Studio',
  program: 'Podcasting',
  i_duration_min: 60,
};

const PLACEHOLDER_CURRENT_PATHWAY = {
  title: 'Creator Pathway',
  track: 'Podcasting Track',
  description: 'You\'re learning, creating and sharing your voice with the world.',
};

const PLACEHOLDER_CURRENT_PROJECT = {
  id: '1',
  title: 'My First Vlog',
  status: 'active',
  description: 'Creating my first vlog episode about my DJ journey',
  stages: ['Idea', 'Planning', 'Recording', 'Editing', 'Review', 'Finished'],
  currentStage: 'Recording',
  currentStageDescription: 'Record your intro segment',
};

const PLACEHOLDER_INTERESTS = [
  { name: 'Marvel', icon: '🦸' },
  { name: 'Music', icon: '🎵' },
  { name: 'Podcasts', icon: '🎙️' },
  { name: 'WWE', icon: '🏆' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'YouTube', icon: '📺' },
];

const PLACEHOLDER_PROGRESS = [
  { title: 'Working more independently', description: 'You\'re prompting less during recording.' },
  { title: 'Completed first intro recording', description: 'Great job recording your opening segment!' },
  { title: 'Planning ahead', description: 'You\'re coming prepared with great ideas.' },
];

const PLACEHOLDER_FEEDBACK = {
  coach: 'Coach Jordan',
  date: 'May 24, 2026',
  message: 'Avery is doing an awesome job! You\'re getting more comfortable behind the mic and your ideas are getting stronger every week.',
};

const PLACEHOLDER_CREATIONS = [
  { title: 'My Introduction Video', status: 'Completed', icon: '🎬', date: 'May 10, 2026' },
  { title: 'Podcast Intro', status: 'Completed', icon: '🎙️', date: 'May 3, 2026' },
  { title: 'Episode 1: Superheroes', status: 'In Progress', icon: '📝', date: 'Recording' },
];

const PLACEHOLDER_OPPORTUNITIES = [
  { title: 'Spin DJ Live - Summer Show', date: 'Jun 14, 2026 - 2:00 PM', icon: '🎧', color: '#7C3AED' },
  { title: 'Camera Operator', date: 'Jun 14, 2026 - 2:00 PM', icon: '📹', color: '#10B981' },
  { title: 'Podcast Interviewer', date: 'Jun 14, 2026 - 2:00 PM', icon: '🎙️', color: '#F59E0B' },
  { title: 'Event Check-In Team', date: 'Jun 14, 2026 - 2:00 PM', icon: '⭐', color: '#7C3AED' },
];

const PATHWAY_JOURNEY = [
  { title: 'Intake', description: 'Your interests and goals', icon: '👤' },
  { title: 'Superbase', description: 'Securely stores your data', icon: '💾' },
  { title: 'Rules Recommendation', description: 'AI-driven learning path', icon: '🧠' },
  { title: 'Teacher Review', description: 'Coach reviews and personalizes', icon: '👨‍🏫' },
  { title: 'Your Pathway', description: 'Personalized learning just for you', icon: '🛤️' },
  { title: 'Projects & Progress', description: 'Create, learn, and grow', icon: '📊' },
  { title: 'Artifacts & Achievement', description: 'Show your progress to the world', icon: '🏆' },
];

export default function SpinDJStudentDashboard() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [user] = useState({
    uid: '52557498',
    firstName: 'Avery',
    lastName: 'Stuart',
    email: 'brookestuart@gmail.com',
  });

  // ============ ROLE SELECTOR ============
  if (!role) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${SPIN_BLACK} 0%, #1a1a1a 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem', fontWeight: 'bold', color: SPIN_PURPLE }}>
            🎧
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Spin DJ Pathways
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#ccc' }}>
            Select your role to continue
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['student', 'teacher', 'organization'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: SPIN_PURPLE,
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============ STUDENT DASHBOARD ============
  if (role === 'student') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
        {/* SIDEBAR */}
        <div
          style={{
            width: '280px',
            background: SPIN_BLACK,
            color: 'white',
            padding: '2rem 1rem',
            overflowY: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: SPIN_PURPLE, marginBottom: '0.25rem' }}>
              SPIN
            </h2>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: SPIN_PURPLE }}>
              PATHWAYS
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '1rem' }}>
              {user?.firstName}
            </p>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'projects', label: 'My Projects', icon: '📋' },
              { id: 'creations', label: 'My Creations', icon: '✨' },
              { id: 'pathway', label: 'My Pathway', icon: '🛤️' },
              { id: 'events', label: 'Events', icon: '📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1rem',
                  background: activeTab === tab.id ? SPIN_PURPLE : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#aaa',
                  border: activeTab === tab.id ? `2px solid ${SPIN_PURPLE}` : 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {/* Bottom section */}
          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: SPIN_PURPLE }}></div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user?.firstName}</p>
                <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Student</p>
              </div>
            </div>
            <button
              onClick={() => setRole(null)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'transparent',
                color: '#aaa',
                border: '1px solid #333',
                borderRadius: '0.4rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Log out
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {/* ============ HOME TAB ============ */}
          {activeTab === 'home' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', color: SPIN_BLACK, marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>
                    Let's keep creating amazing things.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 Sunday, May 25, 2026</p>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: SPIN_PURPLE,
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    👤 View My Profile
                  </button>
                </div>
              </div>

              {/* Context cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Program', value: 'Podcasting', icon: '🎙️' },
                  { label: 'Organization', value: 'Sid Jacobson JCC', icon: '🏢' },
                  { label: 'Class', value: 'Podcasting Group 1', icon: '👥' },
                  { label: 'Profile', value: 'View My Profile', icon: '👤', action: true },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      cursor: card.action ? 'pointer' : 'default',
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      {card.label}
                    </p>
                    <p style={{ fontWeight: 'bold', color: SPIN_BLACK, fontSize: '0.95rem' }}>
                      {card.icon} {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main grid: Left (big card) + Right (sidebar) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Left: Current Pathway + Project */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${SPIN_PURPLE} 0%, #6D28D9 100%)`,
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
                      Current Pathway
                    </p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {PLACEHOLDER_CURRENT_PATHWAY.title}
                    </h2>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🎙️ {PLACEHOLDER_CURRENT_PATHWAY.track}
                    </p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.75rem', lineHeight: '1.5' }}>
                      {PLACEHOLDER_CURRENT_PATHWAY.description}
                    </p>
                  </div>

                  <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1rem' }}>
                      Current Project
                    </p>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                      📹 {PLACEHOLDER_CURRENT_PROJECT.title}
                    </h3>

                    {/* Stages */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      {PLACEHOLDER_CURRENT_PROJECT.stages.map((stage, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: idx < 2 ? 'rgba(255,255,255,0.3)' : idx === 2 ? SPIN_ORANGE : 'rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {idx < 2 ? '✓' : idx === 2 ? '●' : '○'}
                          </div>
                          {idx < PLACEHOLDER_CURRENT_PROJECT.stages.length - 1 && (
                            <div style={{ width: '24px', height: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Current stage */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                      <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Stage</p>
                      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{PLACEHOLDER_CURRENT_PROJECT.currentStage}</p>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        ▶️ {PLACEHOLDER_CURRENT_PROJECT.currentStageDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Next Session */}
                <div>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 'bold' }}>
                      📅 Next Session
                    </p>

                    <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '0.25rem' }}>
                      Tue, May 27, 2026
                    </p>
                    <p style={{ fontSize: '1.2rem', color: SPIN_PURPLE, fontWeight: 'bold', marginBottom: '1.5rem' }}>
                      4:30 PM
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {[
                        { label: 'Teacher', value: 'Coach Jordan', icon: '👨‍🏫' },
                        { label: 'Program', value: 'Podcasting', icon: '🎙️' },
                        { label: 'Location', value: 'In-Studio', icon: '📍' },
                        { label: 'Project', value: 'My First Vlog', icon: '📹' },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <p style={{ fontSize: '0.75rem', color: '#999' }}>{item.label}</p>
                          <p style={{ fontWeight: '600', color: SPIN_BLACK }}>{item.icon} {item.value}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: SPIN_PURPLE,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      View Full Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Three-column section: Things I'm Into, My Progress, Coach's Feedback */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                {/* Things I'm Into */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '1rem', textTransform: 'uppercase' }}>
                    ❤️ Things I'm Into
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    {PLACEHOLDER_INTERESTS.map((interest, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          background: '#f0f0f0',
                          borderRadius: '0.4rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#e0e0e0')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                      >
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{interest.icon}</p>
                        <p style={{ fontSize: '0.8rem', fontWeight: '600', color: SPIN_BLACK }}>{interest.name}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: SPIN_PURPLE,
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}
                  >
                    Edit My Interests ✏️
                  </button>
                </div>

                {/* My Progress */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '1rem', textTransform: 'uppercase' }}>
                    📈 My Progress
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {PLACEHOLDER_PROGRESS.map((progress, idx) => (
                      <div key={idx}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: SPIN_BLACK, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {idx === 0 ? '📈' : idx === 1 ? '✅' : '⭐'} {progress.title}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>{progress.description}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'transparent',
                      color: SPIN_PURPLE,
                      border: `1px solid ${SPIN_PURPLE}`,
                      borderRadius: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginTop: '1rem',
                    }}
                  >
                    See All Progress →
                  </button>
                </div>

                {/* Coach's Feedback */}
                <div style={{ background: '#f9f5ff', padding: '1.5rem', borderRadius: '1rem', border: `1px solid ${SPIN_PURPLE}20` }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '1rem', textTransform: 'uppercase' }}>
                    ⭐ Coach's Feedback
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.75rem' }}>
                    {PLACEHOLDER_FEEDBACK.coach} • {PLACEHOLDER_FEEDBACK.date}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: SPIN_BLACK, lineHeight: '1.6', marginBottom: '1rem' }}>
                    "{PLACEHOLDER_FEEDBACK.message}"
                  </p>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'transparent',
                      color: SPIN_PURPLE,
                      border: `1px solid ${SPIN_PURPLE}`,
                      borderRadius: '0.4rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}
                  >
                    View All Feedback →
                  </button>
                </div>
              </div>

              {/* My Creations */}
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: SPIN_BLACK, textTransform: 'uppercase' }}>
                    📹 My Creations
                  </h3>
                  <button style={{ color: SPIN_PURPLE, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    View All
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {PLACEHOLDER_CREATIONS.map((creation, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <div
                        style={{
                          height: '120px',
                          background: `linear-gradient(135deg, ${SPIN_PURPLE}40, ${SPIN_PURPLE}20)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          position: 'relative',
                        }}
                      >
                        {creation.icon}
                        {creation.status === 'Completed' && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '0.5rem',
                              left: '0.5rem',
                              background: '#10B981',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {creation.status}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '1rem', background: '#fafafa' }}>
                        <p style={{ fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '0.25rem' }}>
                          {creation.title}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#999' }}>
                          📅 {creation.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Opportunities */}
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: SPIN_BLACK, textTransform: 'uppercase' }}>
                    🎯 Upcoming Opportunities
                  </h3>
                  <button style={{ color: SPIN_PURPLE, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    View All
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {PLACEHOLDER_OPPORTUNITIES.map((opp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1.25rem',
                        background: '#fafafa',
                        borderRadius: '0.75rem',
                        borderLeft: `4px solid ${opp.color}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{opp.icon}</p>
                        <p style={{ fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '0.25rem' }}>
                          {opp.title}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#999' }}>{opp.date}</p>
                      </div>
                      <button
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'white',
                          color: opp.color,
                          border: `1px solid ${opp.color}`,
                          borderRadius: '0.4rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        I'm Interested
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathway Journey */}
              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '2rem', textTransform: 'uppercase' }}>
                  🛤️ Your Pathway Journey
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', alignItems: 'start' }}>
                  {PATHWAY_JOURNEY.map((step, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${SPIN_PURPLE}, #6D28D9)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          margin: '0 auto 0.75rem',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        {step.icon}
                      </div>
                      <p style={{ fontWeight: 'bold', color: SPIN_BLACK, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        {step.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#999', lineHeight: '1.3' }}>
                        {step.description}
                      </p>
                      {idx < PATHWAY_JOURNEY.length - 1 && (
                        <div style={{ fontSize: '1.5rem', color: SPIN_PURPLE, marginTop: '0.75rem' }}>→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ OTHER TABS (Placeholders) ============ */}
          {activeTab === 'projects' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>My Projects</h1>
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: '#999' }}>
                Coming soon: Full project management view
              </div>
            </div>
          )}

          {activeTab === 'creations' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>My Creations</h1>
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: '#999' }}>
                Coming soon: Portfolio and creation showcase
              </div>
            </div>
          )}

          {activeTab === 'pathway' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>My Pathway</h1>
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: '#999' }}>
                Coming soon: Learning progress and pathway quiz
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>Events</h1>
              <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: '#999' }}>
                Coming soon: Event calendar and opportunities
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ TEACHER/ORG PLACEHOLDER ============
  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>{role === 'teacher' ? 'Teacher' : 'Organization'} Dashboard (Coming Soon)</h1>
      <button
        onClick={() => setRole(null)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: SPIN_PURPLE,
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Change Role
      </button>
    </div>
  );
}
