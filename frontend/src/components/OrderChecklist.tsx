import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, Circle, Download, ExternalLink } from 'lucide-react';
import type { ExportOptions, ExportType, MosaicData } from '../types';
import { baseplateNeed, orderQuantity, pickABrickOrderCount, PICK_A_BRICK_MAX_PER_ELEMENT, SPARE_RATE } from '../utils/ordering';

const PICK_A_BRICK_URL = 'https://www.lego.com/pick-and-build/pick-a-brick';

interface OrderChecklistProps {
  mosaicData: MosaicData;
  spares: boolean;
  onSparesChange: (spares: boolean) => void;
  baseplates: boolean;
  onBaseplatesChange: (baseplates: boolean) => void;
  isExporting: boolean;
  onExport: (type: ExportType, filename: string, options: ExportOptions) => void;
  onShowInstructions: () => void;
}

interface Step {
  id: string;
  title: string;
  body: ReactNode;
}

function loadDone(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function OrderChecklist({
  mosaicData,
  spares,
  onSparesChange,
  baseplates,
  onBaseplatesChange,
  isExporting,
  onExport,
  onShowInstructions,
}: OrderChecklistProps) {
  // Ticked steps are remembered per mosaic, so a second order session can pick up where it left off
  const storageKey = `order-checklist:${mosaicData.sessionId}`;
  const [done, setDone] = useState<string[]>(() => loadDone(storageKey));
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      // Storage unavailable (private mode): ticks just aren't remembered
    }
  }, [storageKey, done]);

  const items = mosaicData.shoppingList;
  const plateCount = items.reduce((sum, item) => sum + orderQuantity(item.quantity, spares), 0);
  const spareCount = plateCount - mosaicData.metadata.totalPieces;
  const orderCount = pickABrickOrderCount(items, spares);
  const baseplate = baseplateNeed(mosaicData.metadata.baseplateSize);
  const plateWord = mosaicData.metadata.pieceType === 'round' ? 'round plates' : 'plates';
  const exportOptions = { spares, baseplates };

  const downloadOrder = (part: number) => {
    const suffix = orderCount > 1 ? `-order-${part}-of-${orderCount}` : '';
    onExport('pickabrick-csv', `pick-a-brick-${mosaicData.sessionId}${suffix}.csv`, { ...exportOptions, part });
  };

  const steps: Step[] = [];
  if (baseplates) {
    steps.push({
      id: 'baseplate',
      title: `Get ${baseplate.count === 1 ? 'a' : baseplate.count} ${baseplate.studs}×${baseplate.studs} baseplate${baseplate.count === 1 ? '' : 's'}`,
      body: (
        <>
          Pick-a-Brick doesn't sell baseplates. Get {baseplate.count === 1 ? 'one' : `${baseplate.count} of`} LEGO Classic{' '}
          <a href={`https://www.lego.com/search?q=${baseplate.legoSet}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline">
            {baseplate.legoSet} <ExternalLink className="inline w-3 h-3" strokeWidth={1.5} />
          </a>{' '}
          (any colour works, the plates cover it){baseplate.count > 1 && `, laid out ${Math.sqrt(baseplate.count)} × ${Math.sqrt(baseplate.count)}`}.
          The BrickLink list below already includes {baseplate.count === 1 ? 'it' : 'them'}.
        </>
      ),
    });
  }
  steps.push(
    {
      id: 'download',
      title: orderCount === 1 ? 'Download your Pick-a-Brick list' : `Download your ${orderCount} Pick-a-Brick lists`,
      body: (
        <>
          {orderCount > 1 && (
            <p className="mb-3">
              Pick-a-Brick takes at most {PICK_A_BRICK_MAX_PER_ELEMENT} of a part per order, so your {plateWord} are split
              into {orderCount} orders. Each list is a separate checkout.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: orderCount }, (_, i) => (
              <button
                key={i}
                onClick={() => downloadOrder(i + 1)}
                disabled={isExporting}
                className="btn-generate"
                style={{ width: 'auto', padding: '8px 14px' }}
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                {orderCount === 1 ? 'Pick-a-Brick list' : `Order ${i + 1} of ${orderCount}`}
              </button>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'upload',
      title: 'Upload it on Pick-a-Brick',
      body: (
        <>
          Open{' '}
          <a href={PICK_A_BRICK_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline">
            LEGO Pick-a-Brick <ExternalLink className="inline w-3 h-3" strokeWidth={1.5} />
          </a>
          , choose "Upload List" and select the file. Every colour is added to your bag in one go.
        </>
      ),
    },
    {
      id: 'checkout',
      title: orderCount === 1 ? 'Check your bag and check out' : 'Check out, then repeat for each list',
      body:
        orderCount === 1
          ? `Make sure the bag shows ${plateCount.toLocaleString()} ${plateWord} in ${items.length} colours, then check out.`
          : `Check out order 1, then upload order 2 and check out again, until all ${orderCount} are done (${plateCount.toLocaleString()} ${plateWord} in total).`,
    },
    {
      id: 'build',
      title: 'Build it',
      body: (
        <>
          When the parts arrive, follow the{' '}
          <button onClick={onShowInstructions} className="text-accent hover:text-accent-hover underline" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            building instructions
          </button>
          .
        </>
      ),
    },
  );

  const toggle = (id: string) =>
    setDone((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
  const doneCount = steps.filter((s) => done.includes(s.id)).length;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h4 className="font-sans text-text-primary font-semibold" style={{ fontSize: '15px' }}>
          Order from LEGO Pick-a-Brick
        </h4>
        <span className="chip-label">{doneCount} of {steps.length} done</span>
      </div>
      <p className="font-sans text-text-secondary mb-4" style={{ fontSize: '13px' }}>
        {plateCount.toLocaleString()} {plateWord} in {items.length} colours
        {spares && ` (incl. ${spareCount.toLocaleString()} spares)`}
        {baseplates && ` + ${baseplate.count} baseplate${baseplate.count === 1 ? '' : 's'}`}
      </p>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5 font-sans text-text-subtle" style={{ fontSize: '13px' }}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={spares} onChange={(e) => onSparesChange(e.target.checked)} className="accent-[#c4a882]" />
          Add {Math.round(SPARE_RATE * 100)}% spare {plateWord}
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={baseplates} onChange={(e) => onBaseplatesChange(e.target.checked)} className="accent-[#c4a882]" />
          I need {baseplate.count === 1 ? 'a baseplate' : 'baseplates'}
        </label>
      </div>

      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isDone = done.includes(step.id);
          return (
            <li key={step.id} className="flex items-start gap-3">
              <button
                onClick={() => toggle(step.id)}
                aria-label={isDone ? `Mark step ${index + 1} as not done` : `Mark step ${index + 1} as done`}
                aria-pressed={isDone}
                className="flex-shrink-0 mt-0.5"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {isDone
                  ? <CheckCircle2 className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  : <Circle className="w-5 h-5 text-text-muted" strokeWidth={1.5} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-sans font-medium ${isDone ? 'text-text-muted line-through' : 'text-text-primary'}`} style={{ fontSize: '14px' }}>
                  {index + 1}. {step.title}
                </p>
                <div className="font-sans text-text-secondary mt-1" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  {step.body}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
