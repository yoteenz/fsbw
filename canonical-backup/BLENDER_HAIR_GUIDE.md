# Blender Realistic Hair Guide

## Current Setup

I've converted your basic hair mesh to **Blender's Particle Hair System**, which is much more realistic than a simple mesh. Here's what's been set up:

### ✅ What's Done:
1. **Particle Hair System** - 10,000 hair strands
2. **Principled Hair BSDF** - Realistic hair shader
3. **Child Particles** - Makes hair look fuller (10 children per parent)
4. **Clumping** - Natural hair grouping
5. **Kink/Wave** - Subtle natural wave
6. **Length Variation** - Natural randomness

---

## How to Style the Hair (Particle Edit Mode)

### Step 1: Enter Particle Edit Mode

1. Select the mannequin head (`f_af01.002`)
2. Go to **Particle Edit Mode** (dropdown at top, next to Object Mode)
3. You'll see hair guides that you can manipulate

### Step 2: Use Hair Brushes

**Available Brushes:**
- **Comb** - Comb and style hair (use this to create center part)
- **Cut** - Cut hair to length
- **Length** - Adjust hair length
- **Puff** - Add volume
- **Smooth** - Smooth out hair
- **Weight** - Adjust hair weight/thickness

### Step 3: Create Center Part

1. Select **Comb** brush
2. Set brush size (mouse wheel)
3. Comb hair away from center line (Y-axis)
4. Work from front to back to create the part

### Step 4: Adjust Hair Length

1. Select **Length** brush
2. Brush over areas to adjust length
3. Or use **Cut** brush to trim

---

## XGen to Blender Workflow

### Option A: Export XGen Guides → Import as Curves → Convert to Particles

1. **In Maya:**
   ```mel
   // Export XGen guides as curves
   xgen -exportGuides "hairSystem" "path/to/guides.abc"
   ```

2. **In Blender:**
   - Import Alembic: `File > Import > Alembic (.abc)`
   - Select imported curves
   - Convert to particle hair:
     ```python
     import bpy
     # Select curve object
     obj = bpy.context.active_object
     # Convert to mesh
     bpy.ops.object.convert(target='MESH')
     # Add particle system
     bpy.ops.object.particle_system_add()
     ```

### Option B: Use Blender's Native System (Recommended)

Blender's particle hair is actually more integrated and easier to work with than importing XGen. The current setup uses this approach.

---

## Advanced Hair Settings

### Increase Realism:

1. **More Hair Strands:**
   - Particle Settings → Count: 20000+ (more = more realistic, slower)

2. **Better Hair Shader:**
   - Already using Principled Hair BSDF (best option)

3. **Hair Dynamics (for animation):**
   ```python
   settings.use_self_effect = True
   settings.effector_weights.gravity = 1.0
   ```

4. **Hair Cards (for games/realtime):**
   - Use geometry nodes or hair cards instead of particles
   - Better performance, slightly less realistic

---

## Rendering Hair

### Cycles Render Settings:

1. **Hair Rendering:**
   - Go to Render Properties
   - Enable **Hair** in Film section
   - Set **Hair Steps** to 3-5 for quality

2. **Samples:**
   - Increase samples for hair (128-256+)
   - Hair needs more samples than regular geometry

3. **Lighting:**
   - Use area lights for soft hair shadows
   - Rim lights help define hair edges

---

## Tips for Realistic Hair

1. **Use Child Particles** - Already enabled (makes sparse guides look full)
2. **Add Clumping** - Already enabled (natural hair grouping)
3. **Vary Length** - Already enabled (10% variation)
4. **Use Principled Hair BSDF** - Already enabled (best hair shader)
5. **Style in Particle Edit Mode** - Use brushes to create natural flow
6. **Add Slight Kink** - Already enabled (natural wave)

---

## Converting XGen Hair to Blender

If you have XGen hair in Maya and want to bring it to Blender:

### Method 1: Alembic Export
```python
# In Maya
import maya.cmds as cmds
cmds.xgen("exportGuides", "hairSystem", "path/to/hair.abc")
```

### Method 2: OBJ Export (Curves)
- Export XGen guides as OBJ
- Import into Blender
- Convert to particle system

### Method 3: Use Blender's System (Easier)
- Just use Blender's particle hair (what we've set up)
- Style it in Particle Edit mode
- Often better results than importing

---

## Current Hair Configuration

- **Type:** Particle Hair
- **Count:** 10,000 strands
- **Length:** 0.8 units
- **Children:** 10 per parent (100,000 total visible hairs)
- **Material:** Principled Hair BSDF (realistic)
- **Clumping:** Enabled (natural grouping)
- **Kink:** Enabled (subtle wave)
- **Center Part:** Can be styled in Particle Edit mode

The hair is now much more realistic than the basic mesh! You can style it further in Particle Edit mode.
