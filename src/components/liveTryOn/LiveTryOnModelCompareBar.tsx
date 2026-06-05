import {
  LIVE_TRY_ON_PHOTO_MODEL_LABELS,
  type LiveTryOnPhotoModel,
} from '../../constants/liveTryOnSpikeAssets';
import type { LiveTryOnCompareBundles } from '../../utils/liveTryOnPrepareAssets';

type Props = {
  activeModel: LiveTryOnPhotoModel;
  compare?: LiveTryOnCompareBundles;
  onSelectModel: (model: LiveTryOnPhotoModel) => void;
};

const MODELS: LiveTryOnPhotoModel[] = ['nbp', 'gpt2'];

export default function LiveTryOnModelCompareBar({ activeModel, compare, onSelectModel }: Props) {
  if (!compare?.portraits?.nbp && !compare?.portraits?.gpt2) return null;

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      <p
        className="text-center uppercase"
        style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
      >
        SAME PROMPT — COMPARE MODELS. TAP TO USE THAT HAIR ON LIVE VIEW.
      </p>
      <div className="flex gap-2">
        {MODELS.map((model) => {
          const urls = compare.portraits?.[model];
          const active = model === activeModel;
          return (
            <button
              key={model}
              type="button"
              onClick={() => onSelectModel(model)}
              className="flex-1 flex flex-col gap-1 border p-1 bg-white/80"
              style={{
                borderColor: active ? '#EB1C24' : 'rgba(0,0,0,0.2)',
                borderWidth: active ? 2 : 1,
              }}
            >
              <span
                className="text-center uppercase"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '8px',
                  color: active ? '#EB1C24' : '#000',
                }}
              >
                {LIVE_TRY_ON_PHOTO_MODEL_LABELS[model]}
                {active ? ' · LIVE' : ''}
              </span>
              <div className="grid grid-cols-3 gap-0.5">
                {(urls ?? [null, null, null]).map((src, i) => (
                  <div key={i} className="aspect-[3/4] bg-black/5 overflow-hidden">
                    {src ? (
                      <img src={src} alt="" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span
                        className="flex h-full items-center justify-center uppercase"
                        style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#808080' }}
                      >
                        …
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
