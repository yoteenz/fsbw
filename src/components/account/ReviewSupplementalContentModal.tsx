import { useRef, useState, useCallback, useEffect, type CSSProperties, type RefObject } from 'react';
import type { PendingMockReview } from '../../utils/adminPendingMockQueues';
import { fileToDataUrl } from '../../utils/signedOrderFormsStorage';
import {
  MAX_REVIEW_SUPPLEMENTAL_PHOTOS,
  MAX_REVIEW_SUPPLEMENTAL_VIDEOS,
  normalizeSupplementalArrays,
  type StoredReviewSupplementalFields,
} from '../../utils/reviewSupplementalMedia';
import { getUserSubmittedReviewsKey } from '../../constants/reviews';
import { postClientSubmission, getAccessToken } from '../../utils/api';
import { isSupabaseConfigured } from '../../utils/supabase';
import { syncProfileFromApi } from '../../utils/syncFromApi';
import { patchSupplementalOverlay } from '../../utils/accountReviewsSupplementalOverlay';

export type ReviewForSupplementalModal = {
  id: string;
  subtitle: string;
  productName: string;
  body: string;
  rating: number;
} & StoredReviewSupplementalFields;

type Props = {
  open: boolean;
  review: ReviewForSupplementalModal | null;
  clientEmail: string;
  clientNameUpper: string;
  clientProfilePhotoUrl?: string;
  onClose: () => void;
  onSubmitted: () => void;
};

const inputRowStyle: CSSProperties = {
  width: '100%',
  minHeight: '36px',
  height: '36px',
  padding: '8px',
  border: '1px solid #000000',
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
  borderRadius: '0',
  textTransform: 'uppercase',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

export function ReviewSupplementalContentModal({
  open,
  review,
  clientEmail,
  clientNameUpper,
  clientProfilePhotoUrl,
  onClose,
  onSubmitted,
}: Props) {
  const [photo1File, setPhoto1File] = useState<File | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const photo1Ref = useRef<HTMLInputElement>(null);
  const photo2Ref = useRef<HTMLInputElement>(null);
  const video1Ref = useRef<HTMLInputElement>(null);
  const video2Ref = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPhoto1File(null);
    setPhoto2File(null);
    setVideo1File(null);
    setVideo2File(null);
    setError('');
    setSubmitting(false);
    if (photo1Ref.current) photo1Ref.current.value = '';
    if (photo2Ref.current) photo2Ref.current.value = '';
    if (video1Ref.current) video1Ref.current.value = '';
    if (video2Ref.current) video2Ref.current.value = '';
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, review?.id, reset]);

  if (!open || !review) return null;

  const { photos: existingPhotos, videos: existingVideos } = normalizeSupplementalArrays(review);
  const photoSlotsFree = MAX_REVIEW_SUPPLEMENTAL_PHOTOS - existingPhotos.length;
  const videoSlotsFree = MAX_REVIEW_SUPPLEMENTAL_VIDEOS - existingVideos.length;

  const newPhotoCount = (photo1File ? 1 : 0) + (photo2File ? 1 : 0);
  const newVideoCount = (video1File ? 1 : 0) + (video2File ? 1 : 0);

  const showPhotoRow1 = photoSlotsFree >= 1;
  const showPhotoRow2 = photoSlotsFree >= 2;
  const showVideoRow1 = videoSlotsFree >= 1;
  const showVideoRow2 = videoSlotsFree >= 2;

  const handleSubmit = async () => {
    if (newPhotoCount + newVideoCount < 1) {
      setError('PLEASE ADD AT LEAST ONE PHOTO OR VIDEO.');
      return;
    }
    if (newPhotoCount > photoSlotsFree) {
      setError(`YOU CAN ADD UP TO ${photoSlotsFree} MORE PHOTO(S).`);
      return;
    }
    if (newVideoCount > videoSlotsFree) {
      setError(`YOU CAN ADD UP TO ${videoSlotsFree} MORE VIDEO(S).`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const photoUrls: string[] = [...existingPhotos];
      const videoUrls: string[] = [...existingVideos];
      if (photo1File) photoUrls.push(await fileToDataUrl(photo1File));
      if (photo2File) photoUrls.push(await fileToDataUrl(photo2File));
      if (video1File) videoUrls.push(await fileToDataUrl(video1File));
      if (video2File) videoUrls.push(await fileToDataUrl(video2File));

      const cappedPhotos = photoUrls.slice(0, MAX_REVIEW_SUPPLEMENTAL_PHOTOS);
      const cappedVideos = videoUrls.slice(0, MAX_REVIEW_SUPPLEMENTAL_VIDEOS);

      const key = getUserSubmittedReviewsKey(clientEmail);
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      if (!Array.isArray(list)) throw new Error('Invalid storage');

      if (isSupabaseConfigured() && (await getAccessToken())) {
        const res = await postClientSubmission({
          kind: 'review_supplemental',
          clientReviewKey: review.id,
          rating: review.rating,
          product: review.productName,
          subtitle: review.subtitle,
          reviewExcerpt: review.body,
          photos: cappedPhotos,
          videos: cappedVideos,
        });
        const qid = String((res as { id?: string }).id || '').trim();
        if (qid) {
          let hit = false;
          const next = list.map((row) => {
            const r = row as Record<string, unknown>;
            if (String(r.id || '') !== review.id) return row;
            hit = true;
            return {
              ...r,
              supplementalContentStatus: 'pending',
              supplementalPendingQueueId: qid,
            };
          });
          localStorage.setItem(key, JSON.stringify(next));
          if (!hit) {
            patchSupplementalOverlay(clientEmail, review.id, {
              supplementalContentStatus: 'pending',
              supplementalPendingQueueId: qid,
            });
          }
        }
        await syncProfileFromApi();
      } else {
        const queueId = `rev-supp-${review.id}-${Date.now()}`;
        const next = list.map((row) => {
          const r = row as Record<string, unknown>;
          if (String(r.id || '') !== review.id) return row;
          return {
            ...r,
            supplementalContentStatus: 'pending',
            supplementalPendingQueueId: queueId,
          };
        });
        localStorage.setItem(key, JSON.stringify(next));
        patchSupplementalOverlay(clientEmail, review.id, {
          supplementalContentStatus: 'pending',
          supplementalPendingQueueId: queueId,
        });
        const dateShort = new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        });
        const { enqueuePendingMockReviews } = await import('../../utils/adminPendingMockQueues');
        enqueuePendingMockReviews([
          {
            id: queueId,
            client: clientNameUpper,
            email: clientEmail.trim().toLowerCase(),
            product: `${(review.subtitle || 'CUSTOMER REVIEW').toUpperCase()} · SUPPLEMENTAL MEDIA`,
            rating: review.rating,
            excerpt: review.body.trim() || 'SUPPLEMENTAL PHOTOS/VIDEOS FOR THIS REVIEW.',
            date: dateShort,
            status: 'PENDING',
            source: 'client',
            reviewSupplementalSubmission: true,
            targetReviewId: review.id,
            photoUrls: cappedPhotos,
            videoUrls: cappedVideos,
            photoCount: cappedPhotos.length,
            videoCount: cappedVideos.length,
            clientProfilePhotoUrl,
          } as PendingMockReview,
        ]);
      }

      window.dispatchEvent(new CustomEvent('reviewsUpdated'));
      onSubmitted();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SUBMISSION FAILED.');
    } finally {
      setSubmitting(false);
    }
  };

  const chooseFileChip = (
    <span
      style={{
        padding: '4px 8px',
        border: '1px solid #808080',
        borderRadius: '4px',
        backgroundColor: '#F5F5F5',
        color: '#000000',
        textTransform: 'uppercase',
        fontSize: '11px',
        fontFamily: '"Futura PT Book"',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      CHOOSE FILE
    </span>
  );

  const renderFileRow = (
    label: string,
    file: File | null,
    inputRef: RefObject<HTMLInputElement | null>,
    accept: string,
    enabled: boolean,
    onChange: (f: File | null) => void
  ) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ position: 'relative', marginBottom: '4px' }}>
        <input
          type="file"
          accept={accept}
          ref={inputRef as RefObject<HTMLInputElement>}
          disabled={!enabled}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            onChange(f);
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '36px',
            opacity: 0,
            cursor: enabled ? 'pointer' : 'not-allowed',
            zIndex: 3,
            top: 0,
            left: 0,
            pointerEvents: enabled ? 'auto' : 'none',
          }}
        />
        <div
          onClick={() => {
            if (enabled) inputRef.current?.click();
          }}
          style={{
            ...inputRowStyle,
            color: file ? '#808080' : '#EB1C24',
            cursor: enabled ? 'pointer' : 'not-allowed',
            opacity: enabled ? 1 : 0.5,
          }}
        >
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
              {chooseFileChip}
              <span
                style={{
                  marginLeft: '8px',
                  color: '#000000',
                  fontFamily: '"Futura PT Book"',
                  fontSize: '11px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {file.name}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
              {chooseFileChip}
              <span
                style={{ marginLeft: '8px', color: '#808080', fontFamily: '"Futura PT Book"', fontSize: '10px', whiteSpace: 'nowrap' }}
              >
                NO FILE SELECTED
              </span>
            </div>
          )}
        </div>
      </div>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>{label}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white mx-4 overflow-hidden flex flex-col"
        style={{ width: '100%', maxWidth: 'min(400px, 100%)', maxHeight: 'min(85vh, 640px)', border: '1.3px solid #000' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="rev-supp-title"
      >
        <div className="flex justify-between items-center flex-shrink-0 px-4 py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <p id="rev-supp-title" style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>
            ADD REVIEW PHOTOS / VIDEOS
          </p>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Close">
            <img
              src="/assets/close-icon.svg"
              alt=""
              style={{
                width: '18px',
                height: '18px',
                display: 'block',
                filter:
                  'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)',
              }}
            />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3" style={{ minHeight: 0 }}>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '0 0 12px', lineHeight: 1.4 }}>
            UP TO {MAX_REVIEW_SUPPLEMENTAL_PHOTOS} PHOTOS AND {MAX_REVIEW_SUPPLEMENTAL_VIDEOS} VIDEOS TOTAL. YOUR REVIEW TEXT CANNOT BE CHANGED.
          </p>
          {(existingPhotos.length > 0 || existingVideos.length > 0) && (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 12px' }}>
              {existingPhotos.length} APPROVED PHOTO(S), {existingVideos.length} APPROVED VIDEO(S) — YOU CAN FILL REMAINING SLOTS.
            </p>
          )}

          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 500 }}>
            PHOTOS
          </p>
          {showPhotoRow1 ? renderFileRow('PHOTO 1', photo1File, photo1Ref, 'image/*', true, setPhoto1File) : null}
          {showPhotoRow2 ? renderFileRow('PHOTO 2', photo2File, photo2Ref, 'image/*', true, setPhoto2File) : null}
          {!showPhotoRow1 ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px' }}>MAX PHOTOS REACHED.</p>
          ) : null}

          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '16px 0 8px', textTransform: 'uppercase', fontWeight: 500 }}>
            VIDEOS
          </p>
          {showVideoRow1 ? renderFileRow('VIDEO 1', video1File, video1Ref, 'video/*', true, setVideo1File) : null}
          {showVideoRow2 ? renderFileRow('VIDEO 2', video2File, video2Ref, 'video/*', true, setVideo2File) : null}
          {!showVideoRow1 ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px' }}>MAX VIDEOS REACHED.</p>
          ) : null}

          {error ? (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '8px 0 0' }}>{error}</p>
          ) : null}
        </div>
        <div className="flex gap-2 flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid #e5e7eb' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              color: '#EB1C24',
              background: '#fff',
              border: '1.3px solid #000',
              padding: '10px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            style={{
              flex: 1,
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              color: '#fff',
              background: '#EB1C24',
              border: '1.3px solid #000',
              padding: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}
          </button>
        </div>
      </div>
    </div>
  );
}
