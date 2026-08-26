'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, Plus, X, FileText, Calendar, Zap, BookOpen, MessageSquare, LogOut } from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SPIN_ORANGE = '#FFA500';
const SPIN_BLACK = '#000000';

export default function SpinDJDashboard() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // Modal states
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  // ============ INITIALIZATION ============
  useEffect(() => {
    // In a real app, you'd get this from auth context or session
    // For now, we'll use a mock user
    const mockUser = {
      uid: '52557498', // Replace with actual user ID
      firstName: 'Avery',
      lastName: 'Stuart',
      email: 'brookestuart@gmail.com',
    };
    setUser(mockUser);
  }, []);

  useEffect(() => {
    if (user && role === 'student') {
      fetchStudentData();
    }
  }, [user, role]);

  // ============ DATA FETCHING ============
  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      // Fetch upcoming classes
      const { data: classes } = await supabase
        .from('session')
        .select('*')
        .gt('dt_start_utc', new Date().toISOString())
        .order('dt_start_utc', { ascending: true })
        .limit(10);
      setUpcomingClasses(classes || []);

      // Fetch student projects
      const { data: projects } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_uid', user.uid)
        .order('created_at', { ascending: false });
      setUserProjects(projects || []);

      // Fetch student notes
      const { data: notes } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_uid', user.uid)
        .order('created_at', { ascending: false })
        .limit(20);
      setUserNotes(notes || []);

      // Fetch pathways
      const { data: pathwaysData } = await supabase
        .from('pathways')
        .select('*')
        .order('created_at', { ascending: false });
      setPathways(pathwaysData || []);

      // Fetch user's project files
      if (projects && projects.length > 0) {
        const projectIds = projects.map((p) => p.id);
        const { data: files } = await supabase
          .from('project_files')
          .select('*')
          .in('project_id', projectIds);
        setUserFiles(files || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  // ============ ACTIONS ============
  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      const { data, error } = await supabase.from('student_projects').insert([
        {
          student_uid: user.uid,
          title: newProjectTitle,
          description: newProjectDesc,
          status: 'active',
        },
      ]);

      if (!error) {
        setNewProjectTitle('');
        setNewProjectDesc('');
        setShowNewProject(false);
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await supabase.from('student_notes').insert([
        {
          student_uid: user.uid,
          session_id: selectedClass?.k_period,
          content: noteContent,
        },
      ]);

      setNoteContent('');
      setShowNewNote(false);
      fetchStudentData();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleFileUpload = async (e, projectId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(`${projectId}/${fileName}`, file);

      if (!uploadError) {
        // Create file record in database
        await supabase.from('project_files').insert([
          {
            project_id: projectId,
            file_name: file.name,
            file_path: `${projectId}/${fileName}`,
            uploaded_by: user.uid,
          },
        ]);

        fetchStudentData();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSignUpForEvent = (event) => {
    const emailSubject = `Sign Up: ${event.text_title}`;
    const emailBody = `I would like to sign up for: ${event.text_title}\nDate/Time: ${event.dtl_start_local}`;

    // Open email client
    window.location.href = `mailto:spindjacademy@gmail.com?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
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
          {/* Logo */}
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '2rem',
              fontWeight: 'bold',
              color: SPIN_ORANGE,
            }}
          >
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

  // ============ TEACHER VIEW ============
  if (role === 'teacher') {
    return (
      <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
        <h1>Teacher Dashboard (Coming Soon)</h1>
        <button
          onClick={() => setRole(null)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: SPIN_ORANGE,
            color: SPIN_BLACK,
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Change Role
        </button>
      </div>
    );
  }

  // ============ STUDENT DASHBOARD ============
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
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎧</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: SPIN_ORANGE }}>
            Spin DJ
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '3rem' }}>
          {[
            { id: 'classes', label: 'Classes', icon: '📅' },
            { id: 'projects', label: 'Projects', icon: '🎯' },
            { id: 'files', label: 'Files', icon: '📁' },
            { id: 'notes', label: 'Notes', icon: '📝' },
            { id: 'pathways', label: 'Pathways', icon: '✨' },
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

        {/* Events Section */}
        <div style={{ borderTop: `1px solid ${SPIN_ORANGE}`, paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', color: SPIN_ORANGE }}>
            📌 Upcoming Events
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingClasses.slice(0, 3).map((event) => (
              <div
                key={event.k_period}
                style={{
                  background: '#1a1a1a',
                  padding: '0.75rem',
                  borderRadius: '0.4rem',
                  borderLeft: `3px solid ${SPIN_ORANGE}`,
                  fontSize: '0.85rem',
                }}
              >
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{event.text_title}</p>
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  {new Date(event.dtl_start_local || event.dt_start_utc).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleSignUpForEvent(event)}
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    background: SPIN_ORANGE,
                    color: SPIN_BLACK,
                    border: 'none',
                    borderRadius: '0.3rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Sign Up
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setRole(null)}
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.75rem',
            background: '#333',
            color: 'white',
            border: `1px solid ${SPIN_ORANGE}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: SPIN_BLACK, marginBottom: '0.5rem' }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p style={{ color: '#666' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* CLASSES TAB */}
        {activeTab === 'classes' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: SPIN_BLACK }}>
              📅 Upcoming Classes
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {isLoading ? (
                <p>Loading classes...</p>
              ) : upcomingClasses.length === 0 ? (
                <p style={{ color: '#999' }}>No upcoming classes</p>
              ) : (
                upcomingClasses.map((cls) => (
                  <div
                    key={cls.k_period}
                    onClick={() => setSelectedClass(cls)}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      borderLeft: `4px solid ${SPIN_ORANGE}`,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      boxShadow:
                        selectedClass?.k_period === cls.k_period
                          ? `0 0 0 2px ${SPIN_ORANGE}`
                          : '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: SPIN_BLACK }}>
                      {cls.text_title}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      📍 {cls.i_duration_min} minutes
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      🕐{' '}
                      {new Date(cls.dtl_start_local || cls.dt_start_utc).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: SPIN_BLACK }}>🎯 My Projects</h2>
              <button
                onClick={() => setShowNewProject(true)}
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
                <Plus size={18} /> New Project
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {userProjects.length === 0 ? (
                <p style={{ color: '#999' }}>No projects yet. Create one to get started!</p>
              ) : (
                userProjects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 'bold', color: SPIN_BLACK }}>{project.title}</h3>
                      <span
                        style={{
                          background: SPIN_ORANGE,
                          color: SPIN_BLACK,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                        }}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {project.description || 'No description yet'}
                    </p>

                    {/* Project Files */}
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: SPIN_BLACK }}>
                        Files
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {userFiles.filter((f) => f.project_id === project.id).map((file) => (
                          <span
                            key={file.id}
                            style={{
                              background: '#f0f0f0',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.3rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            📄 {file.file_name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Upload File Button */}
                    <label
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: '#f0f0f0',
                        borderRadius: '0.4rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: SPIN_BLACK,
                      }}
                    >
                      <Upload size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(e, project.id)}
                      />
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: SPIN_BLACK }}>
              📁 All Files
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {userFiles.length === 0 ? (
                <p style={{ color: '#999' }}>No files uploaded yet</p>
              ) : (
                userFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <FileText size={32} color={SPIN_ORANGE} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: SPIN_BLACK }}>
                        {file.file_name}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#999' }}>
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', color: SPIN_BLACK }}>📝 My Notes</h2>
              <button
                onClick={() => setShowNewNote(true)}
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
                <Plus size={18} /> New Note
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {userNotes.length === 0 ? (
                <p style={{ color: '#999' }}>No notes yet</p>
              ) : (
                userNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      borderLeft: `4px solid ${SPIN_ORANGE}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                    <p style={{ color: SPIN_BLACK, lineHeight: '1.6' }}>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PATHWAYS TAB */}
        {activeTab === 'pathways' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: SPIN_BLACK }}>
              ✨ Pathways (Quizzes)
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pathways.length === 0 ? (
                <p style={{ color: '#999' }}>No pathways available yet</p>
              ) : (
                pathways.map((pathway) => (
                  <div
                    key={pathway.id}
                    style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: SPIN_BLACK }}>
                      {pathway.title}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {pathway.description}
                    </p>
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: SPIN_ORANGE,
                        color: SPIN_BLACK,
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Start Pathway
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* New Project Modal */}
      {showNewProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '0.75rem',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ color: SPIN_BLACK }}>Create New Project</h2>
              <button
                onClick={() => setShowNewProject(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Project Title"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />

            <textarea
              placeholder="Project Description"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minHeight: '100px',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleCreateProject}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: SPIN_ORANGE,
                  color: SPIN_BLACK,
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Create Project
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f0f0f0',
                  color: SPIN_BLACK,
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Modal */}
      {showNewNote && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '0.75rem',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ color: SPIN_BLACK }}>Add New Note</h2>
              <button
                onClick={() => setShowNewNote(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ✕
              </button>
            </div>

            <textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minHeight: '150px',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddNote}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: SPIN_ORANGE,
                  color: SPIN_BLACK,
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Save Note
              </button>
              <button
                onClick={() => setShowNewNote(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f0f0f0',
                  color: SPIN_BLACK,
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
