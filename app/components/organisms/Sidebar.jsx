'use client';

import { useEffect, useState } from 'react';

import NavItem from '../molecules/NavItem';
import Avatar from '../atoms/Avatar';
import MenuToggle from '../atoms/MenuToggle';
import Icon from '../atoms/Icon';
import Logo from '../atoms/Logo';
import { NAV_ITEMS } from '../../lib/fixtures';

const DRAWER_ID = 'sidebar-drawer';

/**
 * ORGANISM — Sidebar
 * Light rail with brand, primary navigation, profile block and logout.
 *
 * Desktop: the drawer is `display: contents`, so nav and footer stay direct
 * flex children of the rail and the footer can sit at the bottom.
 * Mobile: collapses to a header row with a hamburger that opens the drawer.
 */
export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleTabChange = (id) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <Logo width={150} priority />
        </div>

        <MenuToggle
          open={menuOpen}
          controls={DRAWER_ID}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </div>

      <div
        id={DRAWER_ID}
        className={`sidebar__drawer${menuOpen ? ' sidebar__drawer--open' : ''}`}
      >
        <nav className="sidebar__nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__profile">
            <Avatar name={user.firstName} src={user.avatarUrl} size={34} ring />
            <div>
              <p className="sidebar__profile-name">{user.firstName}</p>
              <p className="sidebar__profile-role">{user.role}</p>
            </div>
            <span className="sidebar__profile-chevron">
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
          <button type="button" className="sidebar__logout" onClick={onLogout}>
            <Icon name="logout" /> Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
