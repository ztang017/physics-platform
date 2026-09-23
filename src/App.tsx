import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { KinematicsModule } from './modules/kinematics/KinematicsModule';
import { ProjectileModule } from './modules/projectile/ProjectileModule';
import { InclineModule } from './modules/incline/InclineModule';
import { CollisionModule } from './modules/collision/CollisionModule';
import { MathToggle } from './components/ui/MathToggle';
import { XPBar } from './components/ui/XPBar';
import { FormulaSheet } from './components/formulaSheet/FormulaSheet';
import { FormulaSheetButton } from './components/formulaSheet/FormulaSheetButton';
import { NotesPanel } from './components/notes/NotesPanel';
import { NotesButton } from './components/notes/NotesButton';
import { StudyBuddyPanel } from './components/studyBuddy/StudyBuddyPanel';
import { StudyBuddyButton } from './components/studyBuddy/StudyBuddyButton';
import { WhatsNewModal } from './components/whatsNew/WhatsNewModal';
import { SpacedReviewPanel } from './components/review/SpacedReviewPanel';
import { SpacedReviewButton } from './components/review/SpacedReviewButton';
import { useUIStore } from './core/store/uiStore';
import type { NotesSection } from './core/store/notesStore';
import type { ModuleId } from './core/store/gameStore';
import styles from './App.module.css';

const WHATS_NEW_SESSION_KEY = 'physicslab-whatsnew-shown';

const MODULE_MAP: Record<string, React.ReactElement> = {
  kinematics: <KinematicsModule />,
  projectile: <ProjectileModule />,
  incline:    <InclineModule />,
  collision:  <CollisionModule />,
};

function ModuleLayout() {
  const { moduleId = '' } = useParams();
  const module = MODULE_MAP[moduleId];

  if (!module) {
    return (
      <div className={styles.notFound}>
        <h2>Module not found</h2>
        <Link to="/" className="btn btn--primary">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className={styles.modulePage}>
      <header className={styles.moduleNav}>
        <Link to="/" className={styles.backLink} aria-label="Back to dashboard">
          ← Dashboard
        </Link>
        <div className={styles.navRight}>
          <SpacedReviewButton />
          <StudyBuddyButton moduleId={moduleId as ModuleId} />
          <NotesButton section={moduleId as NotesSection} />
          <FormulaSheetButton />
          <MathToggle />
          <XPBar compact />
        </div>
      </header>
      <main className={styles.moduleMain}>
        {module}
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} aria-label="Loading..." role="status" />
      <p>Loading module…</p>
    </div>
  );
}

export default function App() {
  const openWhatsNew = useUIStore((s) => s.openWhatsNew);

  // Once per browser session (sessionStorage, not localStorage) — a fresh
  // tab/session sees it again, but navigating between pages in the same
  // session doesn't retrigger it.
  useEffect(() => {
    if (sessionStorage.getItem(WHATS_NEW_SESSION_KEY)) return;
    sessionStorage.setItem(WHATS_NEW_SESSION_KEY, '1');
    openWhatsNew();
  }, [openWhatsNew]);

  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/module/:moduleId" element={<ModuleLayout />} />
        </Routes>
      </Suspense>
      <FormulaSheet />
      <NotesPanel />
      <StudyBuddyPanel />
      <WhatsNewModal />
      <SpacedReviewPanel />
    </HashRouter>
  );
}
