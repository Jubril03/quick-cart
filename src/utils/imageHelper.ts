/**
 * Utilities to handle image processing, file conversion, and sample image generation
 */

export interface SamplePhoto {
  id: string;
  title: string;
  description: string;
  type: 'handwritten' | 'receipt' | 'pidgin_note';
  dataUrl: string;
}

// Generate realistic SVG-based sample images converted to Data URLs
export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample_handwritten_notepad',
    title: 'Handwritten Lined Paper List',
    description: 'Realistic cursive shopping list: 2 bags of rice, 3 indomie, 1 tin tomato, 2 peak milk, 1 crate of eggs',
    type: 'handwritten',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <defs>
          <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15" />
          </filter>
        </defs>
        <rect width="600" height="750" fill="#fdfbf7"/>
        <!-- Legal pad header -->
        <rect x="0" y="0" width="600" height="70" fill="#b91c1c" />
        <text x="30" y="44" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="20">GROCERY SHOPPING LIST</text>
        <text x="440" y="44" fill="#fca5a5" font-family="monospace" font-size="14">OCT 17</text>
        <!-- Red margin line -->
        <line x1="85" y1="70" x2="85" y2="750" stroke="#f87171" stroke-width="2" stroke-opacity="0.7"/>
        <!-- Horizontal blue ruled lines -->
        ${Array.from({ length: 16 }).map((_, i) => `
          <line x1="0" y1="${120 + i * 38}" x2="600" y2="${120 + i * 38}" stroke="#bfdbfe" stroke-width="1.5" stroke-opacity="0.8"/>
        `).join('')}
        <!-- Handwritten items in blue ink -->
        <g fill="#1e3a8a" font-family="Bradley Hand, 'Brush Script MT', 'Segoe Print', cursive, sans-serif" font-size="26">
          <text x="110" y="152">✓ 2 bags of rice (5kg)</text>
          <text x="110" y="190">✓ 3 indomie packets</text>
          <text x="110" y="228">✓ 1 tin of tomato paste</text>
          <text x="110" y="266">✓ 2 peak milk (tin)</text>
          <text x="110" y="304">✓ 1 crate of eggs</text>
          <text x="110" y="342">✓ 1 bottle Kings veg oil</text>
          <text x="110" y="380">✓ 1 loaf sliced bread</text>
        </g>
        <text x="110" y="480" fill="#64748b" font-family="monospace" font-size="15"># Pls buy before evening rush hour!</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample_receipt_photo',
    title: 'Supermarket Thermal Receipt',
    description: 'Old paper receipt: Kings Veg Oil 1L, Golden Penny Spaghetti x 2, Sugar 500g, Family Loaf Bread',
    type: 'receipt',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="550" height="750" viewBox="0 0 550 750">
        <rect width="550" height="750" fill="#f1f5f9"/>
        <!-- Receipt Paper Body with jagged top/bottom -->
        <path d="M 40 20 L 70 30 L 100 20 L 130 30 L 160 20 L 190 30 L 220 20 L 250 30 L 280 20 L 310 30 L 340 20 L 370 30 L 400 20 L 430 30 L 460 20 L 490 30 L 510 20 L 510 710 L 480 700 L 450 710 L 420 700 L 390 710 L 360 700 L 330 710 L 300 700 L 270 710 L 240 700 L 210 710 L 180 700 L 150 710 L 120 700 L 90 710 L 60 700 L 40 710 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <g fill="#1e293b" font-family="'Courier New', Courier, monospace">
          <text x="275" y="80" text-anchor="middle" font-weight="bold" font-size="22">QUICKCART SUPERMARKET</text>
          <text x="275" y="105" text-anchor="middle" font-size="13">Moniya Central, Ibadan, Oyo State</text>
          <text x="275" y="125" text-anchor="middle" font-size="12">Tel: +234 802 345 6789</text>
          <text x="275" y="150" text-anchor="middle" font-size="13">----------------------------------------</text>
          <text x="70" y="180" font-size="14" font-weight="bold">QTY  ITEM DESCRIPTION               PRICE</text>
          <text x="275" y="195" text-anchor="middle" font-size="13">----------------------------------------</text>

          <text x="70" y="225" font-size="14">1    Kings Veg Oil (1L)          2,800</text>
          <text x="70" y="260" font-size="14">2    GP Spaghetti 500g           2,200</text>
          <text x="70" y="295" font-size="14">1    St Louis Sugar 500g           900</text>
          <text x="70" y="330" font-size="14">1    Sliced Family Bread         1,800</text>
          <text x="70" y="365" font-size="14">1    Sunlight Detergent 1kg      2,200</text>
          <text x="70" y="400" font-size="14">2    Dangote Table Salt            900</text>

          <text x="275" y="435" text-anchor="middle" font-size="13">----------------------------------------</text>
          <text x="70" y="465" font-size="16" font-weight="bold">TOTAL ITEMS: 8</text>
          <text x="70" y="495" font-size="18" font-weight="bold">TOTAL PAID:                NGN 10,800</text>
          <text x="275" y="530" text-anchor="middle" font-size="13">----------------------------------------</text>
          <text x="275" y="570" text-anchor="middle" font-size="12">THANK YOU FOR YOUR PATRONAGE!</text>
          <text x="275" y="590" text-anchor="middle" font-size="12">KEEP THIS RECEIPT FOR RE-ORDER</text>
        </g>
      </svg>
    `)}`,
  },
  {
    id: 'sample_pidgin_scribble',
    title: 'Pidgin Handwritten Sticky Note',
    description: 'Quick Nigerian Pidgin sticky note: "Abeg buy 1 carton indomie, 1 bag rice 5kg, 1 rubber garri, 3 tin peak milk"',
    type: 'pidgin_note',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="550" height="550" viewBox="0 0 550 550">
        <!-- Yellow Post-It Note Style -->
        <rect x="25" y="25" width="500" height="500" fill="#fef08a" stroke="#facc15" stroke-width="2" rx="4"/>
        <path d="M 450 450 L 525 450 L 450 525 Z" fill="#eab308" opacity="0.3"/>
        <g fill="#0f172a" font-family="'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive, sans-serif">
          <text x="60" y="80" font-size="28" font-weight="bold" fill="#b45309">Market List for Weekend 🛒</text>
          <text x="60" y="140" font-size="24">- 1 carton of indomie</text>
          <text x="60" y="195" font-size="24">- 1 bag of 5kg rice</text>
          <text x="60" y="250" font-size="24">- 2kg ijebu garri</text>
          <text x="60" y="305" font-size="24">- 3 tin peak milk</text>
          <text x="60" y="360" font-size="24">- 1 basket fresh onions</text>
          <text x="60" y="420" font-size="20" fill="#475569">Oya fast abeg, market dey close by 6!</text>
        </g>
      </svg>
    `)}`,
  },
];

/**
 * Converts a File or Blob or SVG data URL to a raster JPEG/PNG Base64 data string
 * so it works reliably with multimodal Gemini API
 */
export async function convertToRasterBase64(
  input: File | string,
  maxWidth = 1400,
  maxHeight = 1400
): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let shouldRevoke = false;

    if (typeof input === 'string') {
      srcUrl = input;
    } else {
      srcUrl = URL.createObjectURL(input);
      shouldRevoke = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 1000;

        // Resize down if too large for fast transfer
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

        if (shouldRevoke) URL.revokeObjectURL(srcUrl);

        resolve({
          data: base64Data,
          mimeType: 'image/jpeg',
        });
      } catch (e) {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        reject(e);
      }
    };

    img.onerror = (err) => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      reject(new Error('Failed to load image for multimodal processing: ' + err));
    };

    img.src = srcUrl;
  });
}
