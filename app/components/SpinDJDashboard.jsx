'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Users, MapPin, ChevronRight, Play, CheckCircle, Zap } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SPIN_ORANGE = '#FFA500';
const SPIN_BLACK = '#000000';

export default function SpinDJStudentDashboard() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [nextSession, setNextSession] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [upcomingProjects, setUpcomingProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pathwayProgress, setPathwayProgress] = useState(null);

  // Mock user
  useEffect(() => {
    const mockUser = {
      uid: '52557498',
      firstName: 'Avery',
      lastName: 'Stuart',
      email: 'brookestuart@gmail.com',
    };
    setUser(mockUser);
  }, []);

  // Fetch data when user is set and role is student
  useEffect(() => {
    if (user && role === 'student') {
      fetchStudentData();
    }
  }, [user, role]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      // Fetch next session
      const { data: sessions } = await supabase
        .from('session')
        .select('*')
        .gt('dt_start_utc', new Date().toISOString())
        .order('dt_start_utc', { ascending: true })
        .limit(1);
      
      if (sessions && sessions.length > 0) {
        setNextSession(sessions[0]);
      }

      // Fetch active projects
      const { data: projects } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_uid', user.uid)
        .order('created_at', { ascending: false });

      if (projects) {
        const active = projects.filter(p => p.status === 'active');
        const completed = projects.filter(p => p.status === 'completed');
        
        if (active.length > 0) {
          setCurrentProject(active[0]);
        }
        setCompletedProjects(completed);
        setUpcomingProjects(active.slice(1));
      }

      // Fetch upcoming events
      const { data: events } = await supabase
        .from('session')
        .select('*')
        .eq('is_event', true)
        .gt('dt_start_utc', new Date().toISOString())
        .order('dt_start_utc', { ascending: true })
        .limit(5);

      setUpcomingEvents(events || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

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
          <div style={{ fontSize: '4rem', marginBottom: '2rem', fontWeight: 'bold', color: SPIN_ORANGE }}>
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
                  backgroundColor: SPIN_ORANGE,
                  color: SPIN_BLACK,
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
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎧</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: SPIN_ORANGE }}>
              Spin DJ
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>
              {user?.firstName}
            </p>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'home', label: 'Home', icon: '🎵' },
              { id: 'projects', label: 'My Projects', icon: '🎯' },
              { id: 'creations', label: 'My Creations', icon: '✨' },
              { id: 'pathway', label: 'My Pathway', icon: '🛤️' },
              { id: 'events', label: 'Events', icon: '📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1rem',
                  background: activeTab === tab.id ? SPIN_ORANGE : 'transparent',
                  color: activeTab === tab.id ? SPIN_BLACK : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={() => setRole(null)}
            style={{
              marginTop: '3rem',
              width: '100%',
              padding: '0.75rem',
              background: '#333',
              color: 'white',
              border: `1px solid ${SPIN_ORANGE}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* ============ HOME TAB ============ */}
          {activeTab === 'home' && (
            <div>
              {/* A. Welcome */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', color: SPIN_BLACK, marginBottom: '0.25rem' }}>
                  Hey, {user?.firstName}! 👋
                </h1>
                <p style={{ color: '#666', fontSize: '1rem' }}>
                  Let's keep your creative journey going
                </p>
              </div>

              {/* B. Next Session */}
              {nextSession && (
                <div
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2.5rem',
                    borderTop: `4px solid ${SPIN_ORANGE}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: SPIN_BLACK }}>
                    🎬 Next Session
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    {/* Left: Date & Time */}
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Date & Time
                      </p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: SPIN_BLACK }}>
                        {new Date(nextSession.dtl_start_local || nextSession.dt_start_utc).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p style={{ fontSize: '1.1rem', color: '#666' }}>
                        {new Date(nextSession.dtl_start_local || nextSession.dt_start_utc).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Right: Teacher & Details */}
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Session Details
                      </p>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: SPIN_BLACK, marginBottom: '0.5rem' }}>
                        {nextSession.text_title}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        {nextSession.i_duration_min} mins
                      </p>
                    </div>
                  </div>

                  {/* Current Project if applicable */}
                  {currentProject && (
                    <div
                      style={{
                        background: `${SPIN_ORANGE}15`,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        borderLeft: `3px solid ${SPIN_ORANGE}`,
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>
                        Your Active Project
                      </p>
                      <p style={{ fontWeight: 'bold', color: SPIN_BLACK }}>
                        {currentProject.title}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* C. Current Project Focus */}
              {currentProject && (
                <div
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: SPIN_BLACK }}>
                    🎯 Current Project
                  </h2>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: SPIN_ORANGE, marginBottom: '0.5rem' }}>
                    {currentProject.title}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {currentProject.description || 'No description yet. Add one to keep track of your vision!'}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: SPIN_ORANGE,
                        color: SPIN_BLACK,
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Play size={18} /> Continue Working
                    </button>
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#f0f0f0',
                        color: SPIN_BLACK,
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      View Feedback
                    </button>
                  </div>
                </div>
              )}

              {/* D. Upcoming Projects */}
              {upcomingProjects.length > 0 && (
                <div
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: SPIN_BLACK }}>
                    Up Next
                  </h2>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {upcomingProjects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        style={{
                          padding: '1rem',
                          background: '#f9f9f9',
                          borderRadius: '0.5rem',
                          borderLeft: `3px solid ${SPIN_ORANGE}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#f9f9f9')}
                      >
                        <p style={{ fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '0.25rem' }}>
                          {project.title}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#999' }}>
                          {project.description ? project.description.slice(0, 60) + '...' : 'Ready when you are'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* E. Completed Projects (Portfolio) */}
              {completedProjects.length > 0 && (
                <div
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: SPIN_BLACK }}>
                    ✨ Your Portfolio
                  </h2>
                  <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    {completedProjects.length} project{completedProjects.length !== 1 ? 's' : ''} completed
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {completedProjects.map((project) => (
                      <div
                        key={project.id}
                        style={{
                          padding: '1.25rem',
                          background: `${SPIN_ORANGE}15`,
                          borderRadius: '0.75rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: `2px solid ${SPIN_ORANGE}`,
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <CheckCircle size={32} color={SPIN_ORANGE} style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontWeight: 'bold', color: SPIN_BLACK, fontSize: '0.95rem' }}>
                          {project.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ MY PROJECTS TAB ============ */}
          {activeTab === 'projects' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>
                My Projects
              </h1>
              <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>
                Coming soon: Full project management view
              </p>
            </div>
          )}

          {/* ============ MY CREATIONS TAB ============ */}
          {activeTab === 'creations' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>
                My Creations
              </h1>
              <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>
                Coming soon: Portfolio and creation showcase
              </p>
            </div>
          )}

          {/* ============ MY PATHWAY TAB ============ */}
          {activeTab === 'pathway' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>
                My Pathway
              </h1>
              <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>
                Coming soon: Learning progress and pathway quiz
              </p>
            </div>
          )}

          {/* ============ EVENTS TAB ============ */}
          {activeTab === 'events' && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: SPIN_BLACK }}>
                Events
              </h1>
              {upcomingEvents.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.k_period}
                      style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        borderLeft: `4px solid ${SPIN_ORANGE}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <h3 style={{ fontWeight: 'bold', color: SPIN_BLACK, marginBottom: '0.5rem' }}>
                        {event.text_title}
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {new Date(event.dtl_start_local || event.dt_start_utc).toLocaleString()}
                      </p>
                      <button
                        style={{
                          padding: '0.5rem 1rem',
                          background: SPIN_ORANGE,
                          color: SPIN_BLACK,
                          border: 'none',
                          borderRadius: '0.4rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        Sign Up
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>
                  No upcoming events
                </p>
              )}
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
          backgroundColor: SPIN_ORANGE,
          color: SPIN_BLACK,
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
