# Hair Color Variant Generation Scripts

This directory contains scripts and guides to help you generate multiple hair color variants of your mannequin images.

## Quick Start

1. **Prepare your images**
   - Place your original mannequin images in a folder (e.g., `./input`)
   - Images should be named: `natural front.png`, `natural left.png`, `natural right.png`, etc.

2. **Generate prompts**
   ```bash
   python scripts/generate-color-variants.py --input-dir ./input --output-dir ./output
   ```

3. **Create masks** (for inpainting)
   - Follow the guide in `MASK_GUIDE.md`
   - Create masks for the hair area only
   - Save as `[original-name]_mask.png`

4. **Process with AI tool**
   - Use Stable Diffusion WebUI, Runway ML, or Photoshop
   - Follow the prompts generated in the `output/prompts/` directory

5. **Organize output**
   - Generated images should follow naming: `natural front ESPRESSO.png`
   - Place in `/public/assets/` directory

## Tools Comparison

| Tool | Best For | Cost | Batch Processing |
|------|----------|------|------------------|
| Stable Diffusion | Full control, batch processing | Free | ✅ Excellent |
| Adobe Photoshop | Professional workflow | $22.99/mo | ⚠️ Manual |
| Runway ML | Easy to use, web-based | $12-28/mo | ⚠️ Limited |
| Topaz Photo AI | Detail enhancement | $199 one-time | ✅ Good |

## Recommended Workflow

1. **Use Stable Diffusion WebUI** for batch processing
2. **Create masks once** for each view (front, left, right)
3. **Process all colors** using the generated prompts
4. **Review and adjust** individual images if needed
5. **Integrate into codebase** by updating image references

## File Structure After Generation

```
public/assets/
├── natural front.png (original)
├── natural front ESPRESSO.png
├── natural front CHESTNUT.png
├── natural front HONEY.png
├── ... (all colors)
├── natural left.png (original)
├── natural left ESPRESSO.png
├── ... (all colors)
└── ... (repeat for all views and hairlines)
```

## Integration Notes

After generating images, you'll need to update the code to:
1. Check `selectedColor` from localStorage
2. Dynamically load the appropriate image based on color selection
3. Fall back to original images if color variant doesn't exist





