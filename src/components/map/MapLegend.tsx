import { ListFilter, X } from 'lucide-react'
import { useState } from 'react'
import { DEPOT_STYLE, ROAD_STATE_META } from '../../lib/constants'
import { cn } from '../../lib/cn'
import type { DepotId } from '../../types'

function DepotGlyph({ id, size = 10 }: { id: DepotId; size?: number }) {
  const style = DEPOT_STYLE[id]
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0',
        style.shape === 'circle' ? 'rounded-full' : style.shape === 'diamond' ? 'rotate-45 rounded-[2px]' : '',
      )}
      style={{
        width: size,
        height: size,
        background: style.color,
        clipPath: style.shape === 'hexagon' ? 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' : undefined,
      }}
    />
  )
}

export function MapLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-20 max-w-[calc(100%-24px)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mb-1.5 inline-flex items-center gap-1.5 rounded border border-line bg-night-950/90 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-300 backdrop-blur sm:hidden"
      >
        <ListFilter size={10} aria-hidden />
        Legend
      </button>

      <div
        className={cn(
          'w-[224px] rounded-md border border-line/80 bg-night-950/93 p-2.5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm',
          open ? 'block' : 'hidden sm:block',
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="label-micro">Map legend</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close legend"
            className="text-mist-500 hover:text-mist-200 sm:hidden"
          >
            <X size={11} aria-hidden />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <div className="label-tiny mb-1">Ward urgency</div>
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[8.5px] text-mist-400">
              {[
                ['Critical', '#f87171'],
                ['High', '#f0b45c'],
                ['Moderate', '#2dd4bf'],
                ['Guarded', '#7dd3fc'],
              ].map(([label, color]) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="label-tiny mb-1">Depots</div>
            <div className="flex gap-3 text-[8.5px] text-mist-400">
              {(['depot-a', 'depot-b', 'depot-c'] as DepotId[]).map((id) => (
                <span key={id} className="inline-flex items-center gap-1">
                  <DepotGlyph id={id} />
                  {id === 'depot-a' ? 'A' : id === 'depot-b' ? 'B' : 'C'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="label-tiny mb-1">Road state</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span className="h-[2px] w-6 rounded-full bg-[#8fb6c7]" aria-hidden />
                Open
              </div>
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span
                  className="h-[2px] w-6"
                  aria-hidden
                  style={{
                    backgroundImage: `repeating-linear-gradient(90deg, ${ROAD_STATE_META.congested.color} 0 4px, transparent 4px 7px)`,
                  }}
                />
                Congested
              </div>
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span
                  className="h-[2px] w-6"
                  aria-hidden
                  style={{
                    backgroundImage: `repeating-linear-gradient(90deg, ${ROAD_STATE_META.blocked.color} 0 2px, transparent 2px 5px)`,
                  }}
                />
                Blocked
                <span className="text-critical">×</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-line/60 pt-1.5 text-[8.5px] text-mist-400">
            <span
              aria-hidden
              className="h-[2px] w-6"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #5eead4 0 2px, transparent 2px 6px)',
              }}
            />
            Planned delivery route
          </div>
        </div>
        <p className="mt-2 border-t border-line/60 pt-1.5 font-mono text-[7.5px] leading-relaxed text-mist-600">
          Fictional geography · simulated quantities
        </p>
      </div>
    </div>
  )
}
