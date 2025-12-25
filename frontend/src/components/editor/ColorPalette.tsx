import type { LegoColor } from '../../types';

interface ColorPaletteProps {
  colors: LegoColor[];
  selectedColor: LegoColor | null;
  onColorSelect: (color: LegoColor) => void;
}

export function ColorPalette({ colors, selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-white/10 lg:border-b-0">
        <h3 className="text-[10px] xs:text-xs font-semibold text-white">Colors</h3>
        <p className="text-[10px] xs:text-xs text-purple-300 mt-0.5 hidden sm:block">{colors.length} available</p>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-visible p-2 sm:p-3">
        {/* Mobile: horizontal scrollable grid */}
        <div className="grid lg:grid-cols-4 grid-flow-col lg:grid-flow-row auto-cols-[minmax(40px,1fr)] sm:auto-cols-[minmax(50px,1fr)] lg:auto-cols-auto gap-1.5 sm:gap-2">
          {colors.map((color) => {
            const isSelected = selectedColor?.id === color.id;
            return (
              <button
                key={color.id}
                onClick={() => onColorSelect(color)}
                className={`relative w-full aspect-square rounded-lg transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg hover:ring-2 hover:ring-purple-300 touch-manipulation ${
                  isSelected ? 'ring-2 sm:ring-4 ring-white scale-105' : ''
                }`}
                style={{ backgroundColor: color.hex }}
                title={`Apply ${color.name}`}
                aria-label={`Apply ${color.name} to selected pixels`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
