import { useCompanion } from '../context/CompanionContext';

const pageLabels: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/flashcards': 'Flashcards',
  '/vocabulary': 'Vocabulary',
  '/tests': 'Tests',
  '/resources': 'Resources',
  '/ebooks': 'eBooks',
  '/recordings': 'Recordings',
  '/payment': 'Payment',
  '/me/tests': 'Exam Attempts',
  '/profile': 'Profile',
  '/practice-drill': 'Practice Drill',
  '/conversation-practice': 'Conversation Practice',
};

export default function NavigationTransition() {
  const { navigationTarget } = useCompanion();

  if (!navigationTarget) return null;

  const label = pageLabels[navigationTarget] || navigationTarget;

  return (
    <div className="lc-nav-transition">
      <div className="lc-nav-transition__backdrop" />

      <div className="lc-nav-transition__orb">
        <div className="lc-nav-transition__orb-body">
          <div className="lc-nav-transition__orb-core">✦</div>
        </div>
        <div className="lc-nav-transition__trail" />
      </div>

      <div className="lc-nav-transition__label">
        <span className="lc-nav-transition__label-arrow">→</span>
        <span className="lc-nav-transition__label-text">{label}</span>
      </div>
    </div>
  );
}
