# XGen to Blender Hair Guide

## Overview

XGen is Maya's hair/fur system, but Blender has its own powerful hair system that can create equally realistic results. Here are your options:

---

## Option 1: Export XGen from Maya → Import to Blender

### Step 1: Export XGen Hair from Maya

1. **In Maya:**
   - Select your XGen hair system
   - Go to `XGen > Export > Export Guides` or `Export Hair`
   - Choose format: **Alembic (.abc)** or **OBJ sequences**
   - Export the hair guides/curves

2. **Alternative Export Methods:**
   - **Alembic Export:** Best for preserving hair curves
   - **OBJ Export:** Export as curves/guides
   - **FBX:** May lose some hair data

### Step 2: Import into Blender

```python
# In Blender, you can import Alembic:
# File > Import > Alembic (.abc)
# Or use Python:
import bpy
bpy.ops.wm.alembic_import(filepath="path/to/hair.abc")
```

### Step 3: Convert to Blender Hair

After importing, you'll need to convert the curves to Blender's particle hair system.

---

## Option 2: Use Blender's Native Hair System (Recommended)

Blender's particle hair system is very powerful and can create realistic hair without needing Maya. Here's how:

### Blender Hair System Features:
- **Particle Hair:** Native Blender hair system
- **Hair Dynamics:** Physics simulation
- **Hair Shader:** Realistic hair materials
- **Grooming Tools:** Brush-based hair styling
- **Hair Cards/Strands:** Geometry-based hair

---

## Converting Current Hair to Blender Particle Hair

I can help you convert the current basic hair mesh to Blender's particle hair system for much more realistic results.
