# Next Steps: Connect Blender MCP

## Step 1: Enable the Add-on (If Not Already Done)

1. In Blender, go to **`Edit > Preferences`** (or press `Ctrl + Alt + U`)
2. Click the **"Add-ons"** tab
3. Search for **"MCP"** in the search box
4. Find the add-on (should be "Interface: Blender MCP" or similar)
5. **Check the checkbox** ✓ to enable it
6. Close the Preferences window

---

## Step 2: Open the BlenderMCP Panel

1. **Click in the 3D Viewport** (the main 3D view area where you see the default cube)

2. **Open the Sidebar:**
   - Press the **`N` key** (this toggles the sidebar on/off)
   - OR go to **`View > Sidebar`** in the menu
   - You should see a panel appear on the right side

3. **Find the BlenderMCP Tab:**
   - Look at the tabs at the top of the sidebar
   - You should see tabs like: **Item**, **Tool**, **View**, **BlenderMCP**
   - Click on the **"BlenderMCP"** tab

---

## Step 3: Connect to MCP

In the BlenderMCP panel, you should see:

1. **Connection Status** (might say "Not Connected" or show a button)
2. **Options:**
   - Possibly a checkbox for "Use Poly Haven Assets" (optional)
   - A button that says **"Connect to Claude"** or **"Connect to MCP"**

3. **Click the "Connect" button**
   - Wait a few seconds
   - The status should update

---

## Step 4: Verify Connection

After clicking connect, check the status:

✅ **Connected:**
   - Shows "Connected" or "Active"
   - Green indicator or checkmark
   - Button might change to "Disconnect"

❌ **Not Connected:**
   - Shows "Not Connected" or error
   - Try clicking connect again
   - Make sure Cursor is running

---

## Step 5: Test the Connection

Once connected, you're ready! You can now:

1. **Ask me to create 3D models** in Blender
2. Try commands like:
   - "Create a cube in Blender"
   - "Add a sphere to the scene"
   - "Delete the default cube"
   - "Add a light to the scene"

---

## Troubleshooting

### Can't find the BlenderMCP tab?
- Make sure the add-on is enabled (Step 1)
- Restart Blender
- Make sure you're in the 3D Viewport (not other editors)
- Press `N` again to toggle sidebar

### Connection won't work?
- Make sure Cursor is running (MCP server should start automatically)
- Try restarting both Blender and Cursor
- Check that your `mcp.json` file is correct (we set this up earlier)

### Still having issues?
- Check Blender's console: `Window > Toggle System Console` (Windows)
- Look for error messages
- Let me know what you see!
