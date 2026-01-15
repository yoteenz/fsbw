# Alternative Blender MCP Add-on Installation

The original repository is no longer available, but here are working alternatives:

---

## Option 1: ahujasid/blender-mcp (Recommended - Most Similar)

This is a fork that should work similarly to the original.

### Installation Steps:

1. **Download the Repository:**
   - Go to: **https://github.com/ahujasid/blender-mcp**
   - Click the green **"Code"** button
   - Click **"Download ZIP"**
   - Extract the ZIP file to a folder

2. **Install in Blender:**
   - Open Blender
   - Go to `Edit > Preferences > Add-ons`
   - Click **"Install..."** button
   - Navigate to the extracted folder
   - Select the entire folder or the `addon.py` file (whichever Blender accepts)
   - Click **"Install Add-on"**

3. **Enable the Add-on:**
   - Search for **"MCP"** in the add-ons search box
   - Find the add-on and check the box ✓ to enable it

4. **Access the Panel:**
   - Press `N` in the 3D Viewport to open sidebar
   - Look for the **"BlenderMCP"** tab
   - Click **"Connect to Claude"** or **"Connect to MCP"**

---

## Option 2: pranav-deshmukh/blender-mcp

This is a different implementation that uses a server-based approach.

**Note:** This one doesn't have a traditional `addon.py` file - it's a server that runs separately.

**Repository:** https://github.com/pranav-deshmukh/blender-mcp

**Setup:**
- Requires Node.js and pnpm
- Runs as a separate server
- May need different MCP configuration

---

## Option 3: 3D-Agent (Commercial Alternative)

A polished, maintained alternative inspired by Blender MCP.

**Website:** https://3d-agent.com/blender-mcp

**Note:** This may be a commercial/paid solution.

---

## Recommended: Try Option 1 First

The **ahujasid/blender-mcp** repository is the closest alternative to what you were trying to install. It should work with the same MCP setup you've already configured in Cursor.

### Quick Steps:
1. Download: https://github.com/ahujasid/blender-mcp
2. Click "Code" → "Download ZIP"
3. Extract and install in Blender
4. Enable the add-on
5. Connect in the BlenderMCP panel

---

## If None of These Work

If you're having trouble with these alternatives, we can:
1. Try a different approach to connect Blender with MCP
2. Look for other Blender AI integration tools
3. Set up a custom solution

Let me know which option you'd like to try!
