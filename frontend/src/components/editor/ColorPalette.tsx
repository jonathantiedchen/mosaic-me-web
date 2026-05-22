import type { LegoColor } from '../../types';

interface ColorPaletteProps {
  colors: LegoColor[];
  selectedColor: LegoColor | null;
  onColorSelect: (color: LegoColor) => void;
}

export function ColorPalette({ colors, selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
      <span className="chip-label flex-shrink-0" style={{ marginBottom: 0 }}>Colors</span>
      <div className="flex gap-1.5">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onColorSelect(color)}
              className={`flex-shrink-0 rounded-sm touch-manipulation ${
                isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-110 hover:ring-2 hover:ring-accent'
              }`}
              style={{ backgroundColor: color.hex, width: '28px', height: '28px' }}
              title={color.name}
              aria-label={`Apply ${color.name} to selected pixels`}
            />
          );
        })}
      </div>
    </div>
  );
}
