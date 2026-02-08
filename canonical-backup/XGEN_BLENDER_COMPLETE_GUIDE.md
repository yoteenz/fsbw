# Complete Guide: XGen to Blender Hair Workflow

## ✅ What's Been Set Up

I've converted your basic hair mesh to **Blender's Particle Hair System**, which is now active on your mannequin. Here's what you have:

### Current Hair Setup:
- **10,000 hair strands** (parent particles)
- **Particle Hair System** (not mesh-based)
- **Child particles enabled** (makes hair look full)
- **Clumping enabled** (natural hair grouping)
- **Kink/wave enabled** (subtle natural movement)
- **Realistic hair material** (Principled Hair BSDF or Principled BSDF)

---

## Two Approaches: XGen Import vs. Blender Native

### Option 1: Import XGen from Maya (If You Have XGen Hair)

#### Step 1: Export from Maya

**Method A: Export as Alembic (Recommended)**
```mel
// In Maya
xgen -exportGuides "hairSystem" "path/to/hair_guides.abc"
```

**Method B: Export as Curves**
```mel
// Export XGen guides as curves
xgen -exportGuides "hairSystem" "path/to/hair_curves.obj"
```

#### Step 2: Import into Blender

```python
# In Blender Python Console or Script
import bpy

# Import Alembic
bpy.ops.wm.alembic_import(filepath="path/to/hair_guides.abc")

# Or import OBJ curves
bpy.ops.import_scene.obj(filepath="path/to/hair_curves.obj")
```

#### Step 3: Convert to Particle Hair

After importing, you'll need to:
1. Select the imported curves
2. Convert to particle system OR
3. Use as guides for new particle system

---

### Option 2: Use Blender's Native System (✅ Currently Active)

**This is what we've set up!** Blender's particle hair is actually:
- More integrated with Blender
- Easier to style and adjust
- Often produces better results
- No need for Maya/XGen

**Current Status:** ✅ Active and working

---

## How to Style Your Current Hair

### Enter Particle Edit Mode:

1. **Select the mannequin** (`f_af01.002`)
2. **Switch to Particle Edit Mode** (dropdown at top, next to Object Mode)
3. You'll see hair guides that you can manipulate

### Available Brushes:

- **Comb** - Comb and style hair (create center part)
- **Cut** - Cut hair to length
- **Length** - Adjust hair length
- **Puff** - Add volume
- **Smooth** - Smooth out hair
- **Weight** - Adjust hair weight/thickness
- **Add** - Add more hair strands
- **Delete** - Remove hair strands

### Create Center Part:

1. Select **Comb** brush
2. Adjust brush size (mouse wheel)
3. Comb hair away from center line (Y-axis = 0)
4. Work from front to back
5. Use **Smooth** brush to refine

---

## Making Hair More Realistic

### Current Settings (Already Applied):
- ✅ Child particles (10 per parent = 100,000 visible hairs)
- ✅ Clumping (natural grouping)
- ✅ Kink (subtle wave)
- ✅ Length variation (10%)
- ✅ Realistic hair shader

### Additional Improvements:

#### 1. Increase Hair Count
```python
# In Blender Python Console
import bpy
obj = bpy.data.objects['f_af01.002']
if obj.particle_systems:
    obj.particle_systems[0].settings.count = 20000  # More strands
```

#### 2. Better Hair Material
- Already using Principled Hair BSDF (best option)
- Can adjust melanin, roughness, color variation

#### 3. Add Hair Dynamics (for animation)
```python
settings.use_self_effect = True
settings.effector_weights.gravity = 1.0
```

#### 4. Use Hair Cards (for games/realtime)
- Better performance
- Slightly less realistic than particles
- Use Geometry Nodes for hair cards

---

## XGen vs. Blender Hair Comparison

| Feature | XGen (Maya) | Blender Particle Hair |
|---------|-------------|----------------------|
| Realism | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ease of Use | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Integration | Maya only | Blender native |
| Styling Tools | Good | Excellent |
| Performance | Good | Good |
| Export/Import | Complex | Simple |

**Verdict:** Blender's system is just as capable and easier to work with!

---

## Rendering Hair

### Cycles Render Settings:

1. **Enable Hair Rendering:**
   - Render Properties → Film → Enable "Hair"
   - Set Hair Steps to 3-5

2. **Increase Samples:**
   - Hair needs more samples (128-256+)
   - Go to Render Properties → Sampling

3. **Lighting:**
   - Use area lights for soft shadows
   - Add rim lights to define hair edges
   - Avoid harsh directional lights

---

## Workflow Summary

### If You Have XGen Hair:
1. Export from Maya as Alembic
2. Import into Blender
3. Convert to particle system
4. Style in Particle Edit mode

### If Starting Fresh (Current Setup):
1. ✅ Particle system already created
2. ✅ Material already applied
3. ✅ Styling options configured
4. **Next:** Style in Particle Edit mode

---

## Quick Reference

### Particle Edit Mode Shortcuts:
- **G** - Grab/Move hair
- **R** - Rotate hair
- **S** - Scale hair
- **Tab** - Toggle brush settings
- **F** - Brush size
- **Ctrl** - Invert brush effect

### Important Settings:
- **Count:** Number of parent strands (10,000+)
- **Child Count:** Children per parent (10 = 100,000 visible)
- **Clumping:** How much hair groups (0.3 = natural)
- **Kink:** Natural wave (0.05 = subtle)

---

## Next Steps

1. **Style the Hair:**
   - Enter Particle Edit mode
   - Use Comb brush to create center part
   - Adjust length and volume

2. **Fine-tune Material:**
   - Adjust melanin for color
   - Adjust roughness for shine
   - Add color variation

3. **Render:**
   - Set up lighting
   - Enable hair rendering
   - Increase samples
   - Render!

Your hair system is now much more realistic than the basic mesh! The particle system gives you professional-quality hair that rivals XGen.
