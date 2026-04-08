import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import { MOCK_APPROVAL_SIGNED_FORM_ID } from './mockSignedOrderFormForApproval';

const RED = '#EB1C24';
const GRAY_TEXT = '#808080';
const BLACK = '#000000';

/** Live order-form root is 390px with 16px horizontal padding — PDF captures card-only at this inner width. */
const ORDER_FORM_SNAPSHOT_ROOT_W_PX = 390;
const ORDER_FORM_SNAPSHOT_ROOT_PAD_H_PX = 16;
const ORDER_FORM_SNAPSHOT_CARD_PAD_H_PX = 20;
/** Width of the bordered card column (no outer marble gutter in the raster). */
const PDF_SNAPSHOT_CARD_OUTER_W_PX =
  ORDER_FORM_SNAPSHOT_ROOT_W_PX - ORDER_FORM_SNAPSHOT_ROOT_PAD_H_PX * 2;
const MOCK_PLAIN_SNAPSHOT_INNER_W_PX = ORDER_FORM_SNAPSHOT_ROOT_W_PX - ORDER_FORM_SNAPSHOT_ROOT_PAD_H_PX * 2;

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function val(form: StoredSignedOrderForm, key: string): string {
  return String(form.formFields?.[key] ?? '').trim();
}

/** PDF display: all entered text uppercase (labels already uppercase on page). */
function displayUpper(s: string): string {
  return s.trim().toUpperCase();
}

/** Matches `/shop/order-form` inputs: 36px total height incl. padding (`border-box`). */
function setBoxStyle(el: HTMLElement, invalid = false): void {
  Object.assign(el.style, {
    width: '100%',
    height: '36px',
    padding: '8px',
    border: `1.3px solid ${invalid ? RED : BLACK}`,
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    lineHeight: '1.2',
    backgroundColor: '#FFFFFF',
    color: GRAY_TEXT,
    boxSizing: 'border-box',
    borderRadius: '0',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    overflow: 'hidden',
  } as CSSStyleDeclaration);
}

function appendCheckboxMark(box: HTMLElement): void {
  const img = document.createElement('img');
  img.src = '/assets/checkbox.svg';
  img.alt = '';
  Object.assign(img.style, {
    width: '14px',
    height: '14px',
    display: 'block',
    flexShrink: '0',
    objectFit: 'contain',
    objectPosition: 'center',
  });
  box.appendChild(img);
}

function labelStyle(): Partial<CSSStyleDeclaration> {
  return {
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    color: BLACK,
    textTransform: 'uppercase',
    marginBottom: '5px',
    display: 'block',
  };
}

function checkboxRow(checked: boolean, labelHtml: string): HTMLDivElement {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const box = document.createElement('div');
  Object.assign(box.style, {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1.3px solid ${BLACK}`,
    backgroundColor: 'transparent',
    position: 'relative',
    flexShrink: '0',
  });
  if (checked) {
    appendCheckboxMark(box);
  }

  const lab = document.createElement('span');
  Object.assign(lab.style, {
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '10px',
    color: BLACK,
    textTransform: 'uppercase',
    lineHeight: '1.3',
  });
  lab.innerHTML = labelHtml;

  row.appendChild(box);
  row.appendChild(lab);
  return row;
}

function textInput(value: string): HTMLDivElement {
  const d = document.createElement('div');
  setBoxStyle(d);
  d.textContent = displayUpper(value) || ' ';
  return d;
}

function textareaBlock(value: string, solidWhiteBg: boolean): HTMLTextAreaElement {
  const ta = document.createElement('textarea');
  ta.readOnly = true;
  ta.value = displayUpper(value);
  Object.assign(ta.style, {
    width: '100%',
    minHeight: '88px',
    padding: '8px',
    border: `1.3px solid ${BLACK}`,
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    backgroundColor: solidWhiteBg ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
    resize: 'none',
    borderRadius: '0',
    boxSizing: 'border-box',
    outline: 'none',
    color: GRAY_TEXT,
    textTransform: 'uppercase',
  });
  return ta;
}

function uploadBox(hasImage: boolean, imageSrc: string | undefined): HTMLDivElement {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { position: 'relative', width: '100%' });

  const box = document.createElement('div');
  Object.assign(box.style, {
    width: '100%',
    minHeight: '36px',
    padding: '8px',
    border: `1.3px solid ${BLACK}`,
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    backgroundColor: '#FFFFFF',
    color: hasImage ? GRAY_TEXT : RED,
    boxSizing: 'border-box',
    borderRadius: '0',
    textTransform: 'uppercase',
    overflow: hasImage ? 'visible' : 'hidden',
    display: hasImage ? 'block' : 'flex',
    alignItems: hasImage ? 'normal' : 'center',
  });

  if (hasImage && imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = '';
    Object.assign(img.style, {
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      objectPosition: 'left center',
      display: 'block',
    });
    box.appendChild(img);
  } else {
    const inner = document.createElement('div');
    Object.assign(inner.style, { display: 'flex', alignItems: 'center' });
    const choose = document.createElement('span');
    Object.assign(choose.style, {
      padding: '4px 8px',
      border: '1px solid #808080',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
      color: BLACK,
      textTransform: 'uppercase',
      fontSize: '11px',
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    });
    choose.textContent = 'CHOOSE FILE';
    const hint = document.createElement('span');
    Object.assign(hint.style, {
      marginLeft: '8px',
      color: GRAY_TEXT,
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
      fontSize: '10px',
    });
    hint.textContent = 'NO FILE SELECTED';
    inner.appendChild(choose);
    inner.appendChild(hint);
    box.appendChild(inner);
  }

  wrap.appendChild(box);
  return wrap;
}

function signatureArea(signatureSrc: string | undefined, showClearLine: boolean): HTMLDivElement {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { position: 'relative', width: '100%' });
  const box = document.createElement('div');
  Object.assign(box.style, {
    width: '100%',
    height: '150px',
    border: `1.3px solid ${BLACK}`,
    borderRadius: '0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
  });
  if (signatureSrc) {
    const img = document.createElement('img');
    img.src = signatureSrc;
    img.alt = '';
    Object.assign(img.style, {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    });
    box.appendChild(img);
  }
  wrap.appendChild(box);
  if (showClearLine) {
    const clear = document.createElement('p');
    clear.textContent = 'CLEAR SIGNATURE';
    Object.assign(clear.style, {
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
      fontSize: '10px',
      color: BLACK,
      textTransform: 'uppercase',
      marginTop: '6px',
      marginBottom: '0',
      textAlign: 'center',
    });
    wrap.appendChild(clear);
  }
  return wrap;
}

type FieldsLayoutMode = 'fullPage' | 'mockPlainWhite';

/**
 * Form fields block only — same stacking/gaps as `/shop/order-form` (inputs through signature).
 */
function buildOrderFormFieldsColumn(form: StoredSignedOrderForm, mode: FieldsLayoutMode): HTMLElement {
  const signedLike = !form.summaryOnly;
  const solidWhite = mode === 'mockPlainWhite';
  const showClearSignature = mode === 'fullPage';

  const formCol = document.createElement('div');
  Object.assign(formCol.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: solidWhite ? '0' : '20px',
    width: '100%',
  });

  const row = (a: HTMLElement, b?: HTMLElement) => {
    const r = document.createElement('div');
    Object.assign(r.style, { display: 'flex', gap: '15px', width: '100%' });
    const c1 = document.createElement('div');
    Object.assign(c1.style, { flex: '1', minWidth: '0' });
    c1.appendChild(a);
    r.appendChild(c1);
    if (b) {
      const c2 = document.createElement('div');
      Object.assign(c2.style, { flex: '1', minWidth: '0' });
      c2.appendChild(b);
      r.appendChild(c2);
    }
    return r;
  };

  const mkLabeled = (labelText: string, redStar: boolean, input: HTMLElement) => {
    const w = document.createElement('div');
    const lab = document.createElement('label');
    Object.assign(lab.style, labelStyle());
    lab.innerHTML = `${esc(labelText)}${redStar ? `<span style="color:${RED};font-weight:normal">*</span>` : ''}`;
    w.appendChild(lab);
    w.appendChild(input);
    return w;
  };

  formCol.appendChild(
    row(
      mkLabeled('FIRST NAME', true, textInput(val(form, 'firstName'))),
      mkLabeled('LAST NAME', true, textInput(val(form, 'lastName'))),
    ),
  );
  formCol.appendChild(
    row(
      mkLabeled('ORDER NUMBER', true, textInput(val(form, 'orderNumber'))),
      mkLabeled('ORDER DATE', true, textInput(val(form, 'orderDate'))),
    ),
  );

  const emailWrap = document.createElement('div');
  const emailLab = document.createElement('label');
  Object.assign(emailLab.style, labelStyle());
  emailLab.innerHTML = `CONFIRMATION EMAIL<span style="color:${RED};font-weight:normal">*</span>`;
  emailWrap.appendChild(emailLab);
  emailWrap.appendChild(textInput(val(form, 'email')));
  formCol.appendChild(emailWrap);

  const authChecks = document.createElement('div');
  Object.assign(authChecks.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px',
  });
  authChecks.appendChild(
    checkboxRow(
      signedLike,
      `I HAVE AUTHORIZED THIS PURCHASE ON THE DATE LISTED ABOVE.<span style="color:${RED}">*</span>`,
    ),
  );
  authChecks.appendChild(
    checkboxRow(
      signedLike,
      `THE BILLING/SHIPPING ADDRESS BELONGS TO THE CARDHOLDER.<span style="color:${RED}">*</span>`,
    ),
  );
  formCol.appendChild(authChecks);

  const uploadCol = document.createElement('div');
  Object.assign(uploadCol.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px',
    transform: 'translateY(-6px)',
  });

  const photoLabel = document.createElement('label');
  Object.assign(photoLabel.style, labelStyle());
  photoLabel.innerHTML = `<span style="color:${RED};font-family:&quot;Futura PT Medium&quot;,Futura,sans-serif">PHOTO ID</span> (CARDHOLDER) NAME/ADDRESS SHOULD MATCH ORDER DETAILS. YOU MAY CENSOR OTHER INFO.<span style="color:${RED};font-weight:normal">*</span>`;
  const photoBlock = document.createElement('div');
  photoBlock.appendChild(photoLabel);
  const hasPhoto = !!(form.photoIdDataUrl && form.photoIdDataUrl.startsWith('data:image'));
  photoBlock.appendChild(uploadBox(hasPhoto, form.photoIdDataUrl));
  uploadCol.appendChild(photoBlock);

  const cardLabel = document.createElement('label');
  Object.assign(cardLabel.style, labelStyle());
  cardLabel.innerHTML = `<span style="color:${RED};font-family:&quot;Futura PT Medium&quot;,Futura,sans-serif">LAST 4 DIGITS</span> (CARDHOLDER) PHOTO IDENTIFICATION SHOWING FULL NAME AND LAST 4 DIGITS OF CARD. YOU MAY CENSOR OTHER DIGITS. DISREGARD THIS BOX IF USING A PAYMENT PLAN.`;
  const cardBlock = document.createElement('div');
  Object.assign(cardBlock.style, { transform: 'translateY(7px)' });
  cardBlock.appendChild(cardLabel);
  const hasCard = !!(form.cardLastFourDataUrl && form.cardLastFourDataUrl.startsWith('data:image'));
  cardBlock.appendChild(uploadBox(hasCard, form.cardLastFourDataUrl));
  uploadCol.appendChild(cardBlock);

  const addrReason = document.createElement('div');
  Object.assign(addrReason.style, { marginTop: '15px' });
  const addrLab = document.createElement('label');
  Object.assign(addrLab.style, { ...labelStyle(), marginBottom: '12px' });
  addrLab.textContent =
    'IF THE ADDRESS ON YOUR PHOTO ID DIFFERS, PROVIDE THE REASON WHY BELOW. IF NO REASON IS PROVIDED YOUR ORDER MAY BE SUBJECT TO CANCELLATION.';
  addrReason.appendChild(addrLab);
  addrReason.appendChild(textareaBlock(val(form, 'addressDifferenceReason'), solidWhite));
  uploadCol.appendChild(addrReason);

  const signSection = document.createElement('div');
  Object.assign(signSection.style, { marginTop: '13px', marginBottom: solidWhite ? '0' : '-6px' });
  const signRow = document.createElement('div');
  Object.assign(signRow.style, {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
  });
  const bySignInner = document.createElement('div');
  Object.assign(bySignInner.style, { flex: '1', minWidth: '0' });
  const byRow = document.createElement('div');
  Object.assign(byRow.style, { display: 'flex', alignItems: 'flex-start', gap: '8px' });
  const boxWrap = document.createElement('div');
  Object.assign(boxWrap.style, { marginTop: '2px', flexShrink: '0' });
  const b = document.createElement('div');
  Object.assign(b.style, {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1.3px solid ${BLACK}`,
    backgroundColor: 'transparent',
    position: 'relative',
  });
  if (signedLike && form.signatureDataUrl) {
    appendCheckboxMark(b);
  }
  boxWrap.appendChild(b);
  const byText = document.createElement('p');
  byText.innerHTML = `BY SIGNING + SUBMITTING THIS FORM, YOU AGREE THAT ALL SALES ARE FINAL AND THE INFORMATION SUBMITTED HAS BEEN VERIFIED AND IS ACCURATE. YOU ARE CONFIRMING YOUR ORDER AND YOU HAVE AUTHORIZED THIS PURCHASE.<span style="color:${RED};font-weight:normal">*</span>`;
  Object.assign(byText.style, {
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    color: BLACK,
    textTransform: 'uppercase',
    margin: '0',
    lineHeight: '1.3',
    flex: '1',
  });
  byRow.appendChild(boxWrap);
  byRow.appendChild(byText);
  bySignInner.appendChild(byRow);
  signRow.appendChild(bySignInner);
  signSection.appendChild(signRow);
  signSection.appendChild(signatureArea(form.signatureDataUrl, showClearSignature));
  uploadCol.appendChild(signSection);

  formCol.appendChild(uploadCol);
  return formCol;
}

function pdfBrandingHeader(): HTMLElement {
  const h = document.createElement('h2');
  h.textContent = 'FRONTAL SLAYER ORDER AUTHORIZATION FORM';
  Object.assign(h.style, {
    fontFamily: '"Futura PT Medium", Futura, "Trebuchet MS", sans-serif',
    fontSize: '11px',
    color: RED,
    margin: '0 0 14px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '1.35',
  });
  return h;
}

function buildMockPlainWhiteSnapshotRoot(form: StoredSignedOrderForm, pdfColumnOnly: boolean): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-signed-order-form-snapshot', 'mock-plain');
  root.setAttribute('data-pdf-snapshot-root', '1');
  if (pdfColumnOnly) {
    Object.assign(root.style, {
      width: `${MOCK_PLAIN_SNAPSHOT_INNER_W_PX}px`,
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: '#FFFFFF',
      padding: '0',
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    });
  } else {
    Object.assign(root.style, {
      width: `${ORDER_FORM_SNAPSHOT_ROOT_W_PX}px`,
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: '#FFFFFF',
      padding: '20px 20px 24px',
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    });
  }
  root.appendChild(pdfBrandingHeader());
  root.appendChild(buildOrderFormFieldsColumn(form, 'mockPlainWhite'));
  return root;
}

export type BuildSignedOrderFormSnapshotOptions = {
  /**
   * PDF / print: raster width = main card column only (same inner width as live page card),
   * no outer 16px “marble” gutters or full-width submit bar — avoids side whitespace in viewer.
   */
  pdfColumnOnly?: boolean;
};

/**
 * Off-DOM tree matching `/shop/order-form` (full page snapshot: marble, card, intro copy, fields, submit).
 */
export function buildSignedOrderFormSnapshotElement(
  form: StoredSignedOrderForm,
  opts?: BuildSignedOrderFormSnapshotOptions
): HTMLElement {
  const pdfColumnOnly = Boolean(opts?.pdfColumnOnly);

  if (form.id === MOCK_APPROVAL_SIGNED_FORM_ID) {
    return buildMockPlainWhiteSnapshotRoot(form, pdfColumnOnly);
  }

  const root = document.createElement('div');
  root.setAttribute('data-signed-order-form-snapshot', '1');
  root.setAttribute('data-pdf-snapshot-root', '1');

  if (pdfColumnOnly) {
    Object.assign(root.style, {
      width: `${PDF_SNAPSHOT_CARD_OUTER_W_PX}px`,
      boxSizing: 'border-box',
      position: 'relative',
      backgroundColor: '#FFFFFF',
      backgroundImage: 'none',
      padding: '0',
      margin: '0',
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    });
  } else {
    Object.assign(root.style, {
      width: `${ORDER_FORM_SNAPSHOT_ROOT_W_PX}px`,
      boxSizing: 'border-box',
      position: 'relative',
      backgroundImage: `url('/assets/marble-half.png')`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      padding: '20px 16px 24px',
      fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    });
  }

  const card = document.createElement('div');
  card.setAttribute('data-pdf-snapshot-card', '1');
  Object.assign(card.style, {
    border: '1.3px solid black',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '24px',
    paddingBottom: '16px',
    paddingLeft: `${ORDER_FORM_SNAPSHOT_CARD_PAD_H_PX}px`,
    paddingRight: `${ORDER_FORM_SNAPSHOT_CARD_PAD_H_PX}px`,
    marginBottom: pdfColumnOnly ? '0' : '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  });

  card.appendChild(pdfBrandingHeader());

  const introParaStyle = (marginTop: string, marginBottom: string): Partial<CSSStyleDeclaration> => ({
    fontFamily: '"Futura PT Book", Futura, "Trebuchet MS", sans-serif',
    fontSize: '12px',
    color: BLACK,
    lineHeight: '1.8',
    marginTop,
    marginBottom,
    marginLeft: '0',
    marginRight: '0',
    textAlign: 'center',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  });

  const p1 = document.createElement('p');
  p1.innerHTML = esc(
    'THIS FORM SERVES AS PROTECTION AGAINST FRAUD, CHARGEBACKS & AS AN AUTHORIZATION OF PURCHASE FROM THE CLIENT TO FRONTAL SLAYER. THIS FORM MUST BE COMPLETED AFTER PURCHASING HAIR RELATED PRODUCTS TO ENSURE A SMOOTH PROCESS & TO AVOID CANCELLATIONS OR DELAYS. ALL PROVIDED INFORMATION MUST MATCH YOUR ORDER DETAILS.',
  );
  Object.assign(p1.style, introParaStyle('18px', '20px'));

  const p2 = document.createElement('p');
  p2.innerHTML = `${esc(
    'YOUR ORDER WILL NOT BE PROCESSED OR SHIPPED UNTIL THIS FORM IS COMPLETED & SUBMITTED. IF THIS FORM IS NOT FILLED OUT WITHIN 24 HOURS OF PURCHASE, YOUR ORDER WILL BE REFUNDED & CANCELLED. IF YOU HAVE ANY INQUIRIES, SUGGESTIONS OR CONCERNS PLEASE REACH OUT TO ',
  )}<span style="color:${RED};font-weight:600;">CONTACT@FRONTALSLAYER.COM</span>`;
  Object.assign(p2.style, introParaStyle('0', '20px'));

  const p3 = document.createElement('p');
  p3.textContent =
    'THIS DOCUMENT WILL BE RECORDED & A COPY WILL BE SENT TO YOU UPON REQUEST. AS ALWAYS, YOUR BUSINESS IS GREATLY APPRECIATED. THANK YOU SO MUCH FOR SHOPPING WITH US!';
  Object.assign(p3.style, introParaStyle('0', '30px'));

  card.appendChild(p1);
  card.appendChild(p2);
  card.appendChild(p3);
  card.appendChild(buildOrderFormFieldsColumn(form, 'fullPage'));
  root.appendChild(card);

  if (!pdfColumnOnly) {
    const submit = document.createElement('button');
    submit.type = 'button';
    submit.textContent = 'SUBMIT';
    Object.assign(submit.style, {
      width: '100%',
      border: '1.3px solid black',
      color: RED,
      fontFamily: '"Futura PT Medium", Futura, "Trebuchet MS", sans-serif',
      backgroundColor: '#FFFFFF',
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: '600',
      paddingTop: '8px',
      paddingBottom: '8px',
      cursor: 'default',
      boxSizing: 'border-box',
    });
    root.appendChild(submit);
  }

  return root;
}
