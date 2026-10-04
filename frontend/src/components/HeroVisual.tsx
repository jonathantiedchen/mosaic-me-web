/**
 * Landing visual: an example mosaic hanging in a real living room, with the photo it came from.
 * Placement matches the living-room calibration in photoMockups.ts (4.9 px/cm, floor at y=1444 of 2400x1602),
 * showing a 96x96 mosaic (77 cm) centred over the sofa.
 */
const PHOTO_W = 2400;
const PHOTO_H = 1602;
const SIZE_PX = 77 * 4.9;
const LEFT = (1020 - SIZE_PX / 2) / PHOTO_W;
const TOP = (1444 - 90 * 4.9 - SIZE_PX) / PHOTO_H;

export function HeroVisual() {
  return (
    <figure className="m-0">
      <div className="relative overflow-hidden border border-border" style={{ borderRadius: '2px', aspectRatio: `${PHOTO_W} / ${PHOTO_H}` }}>
        <img
          src="/mockups/living-room-hero.jpg"
          alt="A living room with a LEGO mosaic hanging above the sofa"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
        />
        <img
          src="/samples/mosaic_1.png"
          alt=""
          className="absolute"
          style={{
            left: `${LEFT * 100}%`,
            top: `${TOP * 100}%`,
            width: `${(SIZE_PX / PHOTO_W) * 100}%`,
            aspectRatio: '1',
            imageRendering: 'pixelated',
            boxShadow: '0.4vw 0.5vw 1vw rgba(20, 16, 12, 0.28), 0.1vw 0.1vw 0.2vw rgba(20, 16, 12, 0.35)',
          }}
        />
        <div
          className="absolute flex items-center gap-2 panel"
          style={{ left: '3%', bottom: '5%', padding: '6px 10px 6px 6px', boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}
        >
          <img src="/samples/raw_1.jpg" alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '2px' }} />
          <span className="font-sans text-text-subtle" style={{ fontSize: '12px', lineHeight: 1.3 }}>
            Your photo<br />
            <span className="text-text-muted">→ on your wall</span>
          </span>
        </div>
      </div>
      <figcaption className="font-sans text-text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
        See your mosaic in real rooms at true scale before you order a single brick.
      </figcaption>
    </figure>
  );
}
