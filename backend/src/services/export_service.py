"""Export service for generating mosaic files."""
from PIL import Image, ImageDraw, ImageFont
import io
import csv
from typing import List, Dict
from pathlib import Path


class ExportService:
    """Handles export generation for mosaics."""

    PIXEL_SIZE = 20  # Size of each stud in pixels for exports

    def generate_mosaic_png(self, grid: List[List[Dict]], pixel_size: int = None) -> bytes:
        """
        Generate a PNG image of the mosaic.

        Args:
            grid: Mosaic color grid
            pixel_size: Size of each pixel/stud in the output image

        Returns:
            PNG image bytes
        """
        if pixel_size is None:
            pixel_size = self.PIXEL_SIZE

        grid_size = len(grid)
        img_size = grid_size * pixel_size

        # Create image
        img = Image.new('RGB', (img_size, img_size), color='white')
        draw = ImageDraw.Draw(img)

        # Draw each pixel
        for row_idx, row in enumerate(grid):
            for col_idx, cell in enumerate(row):
                x = col_idx * pixel_size
                y = row_idx * pixel_size
                color = cell['hex']

                # Draw filled rectangle for this pixel
                draw.rectangle(
                    [x, y, x + pixel_size - 1, y + pixel_size - 1],
                    fill=color,
                    outline=None
                )

        # Convert to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_instructions_png(
        self,
        grid: List[List[Dict]],
        shopping_list: List[Dict]
    ) -> bytes:
        """
        Generate building instructions as a PNG.

        Args:
            grid: Mosaic color grid
            shopping_list: List of colors with quantities

        Returns:
            PNG image bytes
        """
        # Create color to number mapping
        color_map = {}
        for idx, item in enumerate(shopping_list):
            color_map[item['colorId']] = idx + 1

        grid_size = len(grid)
        cell_size = 30  # Larger cells to fit numbers

        # Calculate image dimensions
        grid_img_size = grid_size * cell_size
        legend_width = 300
        padding = 20
        img_width = grid_img_size + legend_width + padding * 3
        img_height = max(grid_img_size, len(shopping_list) * 35) + padding * 2

        # Create image
        img = Image.new('RGB', (img_width, img_height), color='white')
        draw = ImageDraw.Draw(img)

        # Try to use a default font, fallback to default if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 10)
        except:
            font = ImageFont.load_default()
            font_small = ImageFont.load_default()

        # Draw grid
        for row_idx, row in enumerate(grid):
            for col_idx, cell in enumerate(row):
                x = padding + col_idx * cell_size
                y = padding + row_idx * cell_size
                color = cell['hex']
                color_num = color_map[cell['colorId']]

                # Draw cell background
                draw.rectangle(
                    [x, y, x + cell_size - 1, y + cell_size - 1],
                    fill=color,
                    outline='#cccccc'
                )

                # Draw number
                text = str(color_num)
                # Calculate brightness to determine text color
                rgb = cell['rgb']
                brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
                text_color = '#000000' if brightness > 128 else '#ffffff'

                # Center text in cell
                bbox = draw.textbbox((0, 0), text, font=font_small)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                text_x = x + (cell_size - text_width) // 2
                text_y = y + (cell_size - text_height) // 2

                draw.text((text_x, text_y), text, fill=text_color, font=font_small)

        # Draw legend
        legend_x = padding * 2 + grid_img_size
        legend_y = padding

        draw.text((legend_x, legend_y), "Color Legend", fill='#000000', font=font)
        legend_y += 30

        for idx, item in enumerate(shopping_list):
            y = legend_y + idx * 35

            # Draw number
            draw.text((legend_x, y + 10), f"{idx + 1}.", fill='#000000', font=font)

            # Draw color swatch
            swatch_x = legend_x + 25
            draw.rectangle(
                [swatch_x, y + 5, swatch_x + 24, y + 24],
                fill=item['hex'],
                outline='#cccccc'
            )

            # Draw color name
            name_x = swatch_x + 35
            draw.text((name_x, y + 10), item['colorName'], fill='#000000', font=font_small)

        # Convert to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_shopping_csv(
        self,
        shopping_list: List[Dict],
        piece_type: str
    ) -> bytes:
        """
        Generate a shopping list as CSV.

        Args:
            shopping_list: List of colors with quantities
            piece_type: Type of pieces

        Returns:
            CSV file bytes
        """
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        # Write header
        writer.writerow(['Color ID', 'Color Name', 'Quantity', 'Piece Type', 'Hex Color'])

        # Write data
        piece_name = f"{piece_type.capitalize()} 1×1 Plate"
        for item in shopping_list:
            writer.writerow([
                item['colorId'],
                item['colorName'],
                item['quantity'],
                piece_name,
                item['hex']
            ])

        # Convert to bytes
        csv_content = buffer.getvalue()
        return csv_content.encode('utf-8')

    def generate_pickabrick_csv(
        self,
        shopping_list: List[Dict]
    ) -> bytes:
        """
        Generate a LEGO Pick-a-Brick compatible CSV.

        This format can be uploaded directly to LEGO's Pick-a-Brick service
        to automatically add all required pieces to your cart.

        Format: elementId    quantity

        Args:
            shopping_list: List of colors with quantities and legoIds

        Returns:
            CSV file bytes in Pick-a-Brick format
        """
        buffer = io.StringIO()
        writer = csv.writer(buffer, delimiter='\t')

        # Write header
        writer.writerow(['elementId', 'quantity'])

        # Write data (sorted by quantity descending for better readability)
        sorted_list = sorted(shopping_list, key=lambda x: x['quantity'], reverse=True)
        for item in sorted_list:
            writer.writerow([
                item['legoId'],
                item['quantity']
            ])

        # Convert to bytes
        csv_content = buffer.getvalue()
        return csv_content.encode('utf-8')
