import React, { Suspense } from 'react';
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
import styles from './App.module.css';

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
  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/module/:moduleId" element={<ModuleLayout />} />
        </Routes>
      </Suspense>
      <FormulaSheet />
    </HashRouter>
  );
}
