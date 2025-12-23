#!/usr/bin/env python3
"""
Hair Color Variant Generator Script
This script helps automate the process of generating hair color variants
using Stable Diffusion or other AI tools via API.

Usage:
    python generate-color-variants.py --input-dir ./input --output-dir ./output
"""

import os
import json
import argparse
from pathlib import Path
from typing import Dict, List

# Color definitions matching your color options
COLOR_DEFINITIONS = {
    'JET BLACK': {
        'hex': '#000000',
        'prompt': 'deep black hair, natural black hair color',
        'negative': 'brown, red, blonde, colored'
    },
    'OFF BLACK': {
        'hex': '#2A2424',
        'prompt': 'natural black hair, off-black hair color',
        'negative': 'brown, red, blonde, colored'
    },
    'ESPRESSO': {
        'hex': '#3B1301',
        'prompt': 'rich dark brown hair, espresso brown hair color',
        'negative': 'black, red, blonde, light brown'
    },
    'CHESTNUT': {
        'hex': '#6C2D11',
        'prompt': 'medium brown hair, chestnut brown hair color',
        'negative': 'black, red, blonde, dark brown'
    },
    'HONEY': {
        'hex': '#C58628',
        'prompt': 'golden brown hair, honey brown hair color',
        'negative': 'black, red, dark brown, blonde'
    },
    'AUBURN': {
        'hex': '#9C5617',
        'prompt': 'reddish brown hair, auburn hair color',
        'negative': 'black, blonde, dark brown, pure red'
    },
    'COPPER': {
        'hex': '#802F02',
        'prompt': 'copper red hair, copper colored hair',
        'negative': 'black, blonde, brown, orange'
    },
    'GINGER': {
        'hex': '#F64F07',
        'prompt': 'bright orange hair, ginger orange hair color',
        'negative': 'black, brown, red, blonde'
    },
    'SANGRIA': {
        'hex': '#7E0A1E',
        'prompt': 'deep red wine hair, sangria red hair color',
        'negative': 'black, brown, blonde, pink'
    },
    'CHERRY': {
        'hex': '#D70808',
        'prompt': 'bright cherry red hair, cherry red hair color',
        'negative': 'black, brown, blonde, dark red'
    },
    'RASPBERRY': {
        'hex': '#EF0461',
        'prompt': 'raspberry pink hair, raspberry pink hair color',
        'negative': 'black, brown, red, blonde'
    },
    'PLUM': {
        'hex': '#640E82',
        'prompt': 'deep plum purple hair, plum purple hair color',
        'negative': 'black, brown, red, blonde'
    },
    'COBALT': {
        'hex': '#290481',
        'prompt': 'deep cobalt blue hair, cobalt blue hair color',
        'negative': 'black, brown, red, blonde, light blue'
    },
    'TEAL': {
        'hex': '#46EBCA',
        'prompt': 'teal green hair, teal green hair color',
        'negative': 'black, brown, red, blonde, dark green'
    },
    'SLIME': {
        'hex': '#03D92A',
        'prompt': 'bright lime green hair, lime green hair color',
        'negative': 'black, brown, red, blonde, dark green'
    },
    'CITRINE': {
        'hex': '#E2E91C',
        'prompt': 'citrine yellow hair, bright yellow hair color',
        'negative': 'black, brown, red, blonde, orange'
    }
}

# Image views to process
IMAGE_VIEWS = ['front', 'left', 'right']
HAIRLINE_TYPES = ['natural', 'peak', 'lagos']


def generate_prompts(input_dir: str, output_dir: str):
    """Generate prompt files for each color variant."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    prompts_dir = output_path / 'prompts'
    prompts_dir.mkdir(exist_ok=True)
    
    input_path = Path(input_dir)
    
    # Find all base images
    base_images = {}
    for hairline in HAIRLINE_TYPES:
        for view in IMAGE_VIEWS:
            pattern = f'{hairline} {view}.png'
            matching = list(input_path.glob(pattern))
            if matching:
                base_images[f'{hairline}_{view}'] = matching[0]
    
    # Generate prompts for each combination
    all_prompts = []
    
    for image_key, image_path in base_images.items():
        hairline, view = image_key.split('_')
        
        for color_name, color_info in COLOR_DEFINITIONS.items():
            prompt_data = {
                'input_image': str(image_path),
                'output_filename': f'{hairline} {view} {color_name}.png',
                'color_name': color_name,
                'color_hex': color_info['hex'],
                'prompt': f"{color_info['prompt']}, high quality, detailed, professional photography",
                'negative_prompt': f"{color_info['negative']}, blurry, low quality, distorted",
                'hairline_type': hairline,
                'view': view
            }
            
            all_prompts.append(prompt_data)
            
            # Save individual prompt file
            prompt_file = prompts_dir / f'{hairline}_{view}_{color_name}.json'
            with open(prompt_file, 'w') as f:
                json.dump(prompt_data, f, indent=2)
    
    # Save master prompt file
    master_file = output_path / 'all_prompts.json'
    with open(master_file, 'w') as f:
        json.dump(all_prompts, f, indent=2)
    
    print(f"Generated {len(all_prompts)} prompt files in {prompts_dir}")
    print(f"Master prompt file saved to {master_file}")
    
    return all_prompts


def create_stable_diffusion_script(prompts: List[Dict], output_dir: str):
    """Create a script for Stable Diffusion WebUI batch processing."""
    script_content = """# Stable Diffusion Batch Processing Script
# This script can be used with Stable Diffusion WebUI API

import requests
import json
import time
from pathlib import Path

API_URL = "http://127.0.0.1:7860"  # Default SD WebUI API URL

def process_image(prompt_data):
    \"\"\"Process a single image with the given prompt.\"\"\"
    payload = {
        "prompt": prompt_data['prompt'],
        "negative_prompt": prompt_data['negative_prompt'],
        "init_images": [prompt_data['input_image']],  # Base64 encoded
        "mask": None,  # You'll need to create masks for hair area
        "steps": 30,
        "cfg_scale": 7.5,
        "inpainting_fill": 1,
        "inpaint_full_res": True,
        "inpaint_full_res_padding": 32,
        "denoising_strength": 0.75
    }
    
    response = requests.post(f"{API_URL}/sdapi/v1/img2img", json=payload)
    return response.json()

# Load prompts
with open('all_prompts.json', 'r') as f:
    prompts = json.load(f)

# Process each prompt
for i, prompt_data in enumerate(prompts):
    print(f"Processing {i+1}/{len(prompts)}: {prompt_data['output_filename']}")
    result = process_image(prompt_data)
    # Save result
    # ... (implement saving logic)
    time.sleep(1)  # Rate limiting
"""
    
    script_file = Path(output_dir) / 'sd_batch_process.py'
    with open(script_file, 'w') as f:
        f.write(script_content)
    
    print(f"Stable Diffusion script saved to {script_file}")


def create_mask_guide():
    """Create a guide for creating masks."""
    guide = """# How to Create Hair Masks for Inpainting

## Using Photoshop:
1. Open your mannequin image
2. Use Select Subject (AI-powered selection)
3. Refine selection to only include hair
4. Save as PNG with transparency (hair = white, rest = black)
5. Name it: [original-name]_mask.png

## Using GIMP:
1. Open image
2. Use Fuzzy Select tool to select hair
3. Create new layer, fill selection with white
4. Invert selection, fill with black
5. Export as PNG

## Using Online Tools:
- Remove.bg (to isolate subject)
- Photopea.com (free Photoshop alternative)

## Mask Requirements:
- Hair area: White (RGB 255, 255, 255)
- Everything else: Black (RGB 0, 0, 0)
- PNG format with transparency
- Same dimensions as original image
"""
    
    return guide


def main():
    parser = argparse.ArgumentParser(description='Generate hair color variant prompts')
    parser.add_argument('--input-dir', type=str, default='./input',
                       help='Directory containing original mannequin images')
    parser.add_argument('--output-dir', type=str, default='./output',
                       help='Directory to save prompts and generated images')
    
    args = parser.parse_args()
    
    print("Hair Color Variant Generator")
    print("=" * 50)
    print(f"Input directory: {args.input_dir}")
    print(f"Output directory: {args.output_dir}")
    print()
    
    # Generate prompts
    prompts = generate_prompts(args.input_dir, args.output_dir)
    
    # Create Stable Diffusion script
    create_stable_diffusion_script(prompts, args.output_dir)
    
    # Create mask guide
    guide = create_mask_guide()
    guide_file = Path(args.output_dir) / 'MASK_GUIDE.md'
    with open(guide_file, 'w') as f:
        f.write(guide)
    
    print(f"\nMask guide saved to {guide_file}")
    print("\nNext steps:")
    print("1. Create masks for each base image (hair area only)")
    print("2. Use the generated prompts with Stable Diffusion or other AI tools")
    print("3. Process images in batch")
    print("4. Place generated images in /public/assets/ with proper naming")


if __name__ == '__main__':
    main()


