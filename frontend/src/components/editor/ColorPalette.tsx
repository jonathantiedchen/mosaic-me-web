import type { LegoColor } from '../../types';

interface ColorPaletteProps {
  colors: LegoColor[];
  selectedColor: LegoColor | null;
  onColorSelect: (color: LegoColor) => void;
}

export function ColorPalette({ colors, selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white">Colors</h3>
        <p className="text-xs text-purple-300 mt-0.5">{colors.length} available</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => {
            const isSelected = selectedColor?.id === color.id;
            return (
              <button
                key={color.id}
                onClick={() => onColorSelect(color)}
                className={`relative w-full aspect-square rounded-lg transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-lg hover:ring-2 hover:ring-purple-300 ${
                  isSelected ? 'ring-4 ring-white scale-105' : ''
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
