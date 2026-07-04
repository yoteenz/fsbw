import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVisionModeById } from '../../studio-os-core/vision-engine/store';
import { bootstrapVisionShareSlug } from '../../studio-os-core/vision-engine/shareBootstrap';
import LoadingScreen from '../../components/base/LoadingScreen';

/** Vision Share™ — server-persisted interactive presentation (works on any device). */
export default function VisionSharePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const launch = useCallback(
    async (pwd?: string) => {
      if (!slug) {
        navigate('/home/shop', { replace: true });
        return;
      }

      setError('');
      const result = await bootstrapVisionShareSlug(slug, pwd);

      switch (result.status) {
        case 'ready': {
          const mode = getVisionModeById(result.link.modeId, result.link.workspaceId);
          const firstRoute = mode?.stops.find((s) => s.route)?.route ?? '/home/shop';
          navigate(firstRoute, { replace: true });
          break;
        }
        case 'password':
          setLabel(result.label ?? 'Protected Vision');
          setPasswordPrompt(true);
          break;
        case 'expired':
          setError('This Vision link has expired.');
          break;
        case 'not_found':
          setError('Vision link not found. Ask your host for a valid link.');
          break;
        case 'error':
          setError(result.message || 'Could not open Vision link.');
          break;
      }
    },
    [navigate, slug]
  );

  useEffect(() => {
    void launch();
  }, [launch]);

  if (passwordPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-100">
        <form
          className="w-full max-w-sm p-6 border bg-white/80 backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            void launch(password);
          }}
        >
          <p className="text-xs font-futura uppercase tracking-widest text-neutral-500 mb-2">Vision Share</p>
          <h1 className="text-xl mb-4" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>
            {label}
          </h1>
          <label className="block text-[10px] font-futura uppercase text-neutral-600 mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 mb-4 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}
          <button type="submit" className="w-full py-2 text-xs font-futura uppercase bg-black text-white">
            Enter
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-neutral-600 mb-4">{error}</p>
          <button
            type="button"
            className="text-xs font-futura uppercase underline"
            onClick={() => navigate('/home/shop', { replace: true })}
          >
            Go to homepage
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
