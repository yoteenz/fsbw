import { useNavigate } from 'react-router-dom';
import { CollectiblesGallery } from '../../../components/account/collectibles/CollectiblesGallery';

/** Mobile Account → Collectibles (`/account/collectibles`). */
export default function CollectiblesPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        paddingTop: 72,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/account')}
        style={{
          marginBottom: 16,
          border: 'none',
          background: 'transparent',
          fontFamily: '"Futura PT Medium"',
          fontSize: 11,
          letterSpacing: '0.08em',
          color: '#666',
          cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        ← Account
      </button>
      <CollectiblesGallery />
    </div>
  );
}
