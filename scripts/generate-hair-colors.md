# Hair Color Variant Generation Workflow

## Overview
This guide helps you generate multiple hair color variants of your mannequin images using AI tools.

## Option 1: Using Stable Diffusion (Recommended for Batch Processing)

### Prerequisites
- Python 3.8+
- Stable Diffusion WebUI (AUTOMATIC1111) or ComfyUI
- Your original mannequin images

### Steps

1. **Install Stable Diffusion WebUI**
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   cd stable-diffusion-webui
   ./webui.sh  # or webui.bat on Windows
   ```

2. **Use Inpainting for Hair Color Changes**
   - Load your mannequin image
   - Use the "Inpaint" tab
   - Mask only the hair area (use the brush tool)
   - Use prompts like:
     - "natural black hair" (for OFF BLACK)
     - "rich dark brown hair" (for ESPRESSO)
     - "medium brown hair" (for CHESTNUT)
     - "golden brown hair" (for HONEY)
     - "reddish brown hair" (for AUBURN)
     - "copper red hair" (for COPPER)
     - "bright orange hair" (for GINGER)
     - "deep red wine hair" (for SANGRIA)
     - "bright cherry red hair" (for CHERRY)
     - "raspberry pink hair" (for RASPBERRY)
     - "deep plum purple hair" (for PLUM)
     - "deep cobalt blue hair" (for COBALT)
     - "teal green hair" (for TEAL)
     - "bright lime green hair" (for SLIME)
     - "citrine yellow hair" (for CITRINE)

3. **Batch Process**
   - Use the provided Python script (see `generate-color-variants.py`)
   - Or manually process each color

## Option 2: Using Adobe Photoshop

1. **Open your mannequin image**
2. **Select the hair area** (use Select Subject or manually)
3. **Use Generative Fill or Color Replacement**
   - For Generative Fill: Select hair → Right click → Generative Fill → Enter color description
   - For Color Replacement: Image → Adjustments → Replace Color → Select hair → Adjust hue/saturation
4. **Save each variant** with a clear naming convention

## Option 3: Using Runway ML

1. Upload your image to Runway ML
2. Use the Inpaint tool
3. Mask the hair area
4. Enter color description in the prompt
5. Generate and download

## File Naming Convention

Save your images with this naming pattern:
- `natural front [COLOR].png` (e.g., "natural front ESPRESSO.png")
- `natural left [COLOR].png`
- `natural right [COLOR].png`
- `peak front [COLOR].png`
- `peak left [COLOR].png`
- `peak right [COLOR].png`
- `lagos front [COLOR].png`
- `lagos left [COLOR].png`
- `lagos right [COLOR].png`

## Color Mapping

| Color Name | Hex Code | Description |
|------------|----------|-------------|
| JET BLACK | #000000 | Deep black |
| OFF BLACK | #160604 | Natural black (default) |
| ESPRESSO | #3B1301 | Rich dark brown |
| CHESTNUT | #6C2D11 | Medium brown |
| HONEY | #C58628 | Golden brown |
| AUBURN | #9C5617 | Reddish brown |
| COPPER | #802F02 | Copper red |
| GINGER | #F64F07 | Bright orange |
| SANGRIA | #7E0A1E | Deep red wine |
| CHERRY | #FF1400 | Bright cherry red |
| RASPBERRY | #DA3063 | Raspberry pink |
| PLUM | #640E82 | Deep plum purple |
| COBALT | #290481 | Deep cobalt blue |
| TEAL | #46EBCA | Teal green |
| SLIME | #03D92A | Bright lime green |
| CITRINE | #E2E91C | Citrine yellow |

## Integration into Codebase

After generating images, place them in:
- `/public/assets/` for the main images
- Update the code to reference these new images based on selected color





