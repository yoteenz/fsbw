# How to Connect Blender MCP Add-on

## Step 1: Install the Add-on (If Not Already Done)

1. **Download the add-on:**
   - Go to: https://github.com/Gorav22/Blender-mcp
   - Click on the green **"Code"** button
   - Click **"Download ZIP"** or clone the repository
   - Extract the ZIP file
   - Find the `addon.py` file

2. **Install in Blender:**
   - Open Blender
   - Go to **`Edit > Preferences`** (or press `Ctrl + Alt + U`)
   - Click on the **"Add-ons"** tab (on the left sidebar)
   - Click the **"Install..."** button (top right)
   - Navigate to and select the `addon.py` file
   - Click **"Install Add-on"**

3. **Enable the Add-on:**
   - In the Add-ons list, search for **"Blender MCP"** or **"MCP"**
   - Find **"Interface: Blender MCP"** in the list
   - **Check the checkbox** next to it to enable it
   - The add-on is now installed and enabled!

---

## Step 2: Open the BlenderMCP Panel

1. **Make sure you're in the 3D Viewport:**
   - Click on the 3D Viewport window (the main 3D view area)

2. **Open the Sidebar:**
   - Press the **`N` key** (this toggles the sidebar)
   - OR go to **`View > Sidebar`** in the menu
   - You should see a panel appear on the right side of the 3D Viewport

3. **Find the BlenderMCP Tab:**
   - Look at the tabs at the top of the sidebar
   - You should see tabs like: **Item**, **Tool**, **View**, **BlenderMCP**
   - Click on the **"BlenderMCP"** tab

---

## Step 3: Connect to MCP

In the BlenderMCP panel, you should see:

1. **Connection Status:**
   - It might say "Not Connected" or show a connection button

2. **Options:**
   - There may be a checkbox for **"Use Poly Haven Assets"** (optional)
   - A button that says **"Connect to Claude"** or **"Connect to MCP"**

3. **Click "Connect to Claude" or "Connect to MCP"**
   - The status should change to show it's connecting or connected

---

## Step 4: Verify Connection Status

After clicking connect, you should see one of these:

✅ **Connected/Active:**
   - Status shows "Connected" or "Active"
   - Green indicator or checkmark
   - The button might change to "Disconnect"

❌ **Not Connected:**
   - Status shows "Not Connected" or "Disconnected"
   - Red indicator or X mark
   - Button says "Connect"

⚠️ **Connecting:**
   - Status shows "Connecting..." or loading indicator
   - Wait a few seconds for it to complete

---

## Step 5: Troubleshooting Connection Issues

If it's not connecting:

1. **Check MCP Server is Running:**
   - The MCP server needs to be running for Blender to connect
   - In Cursor, the MCP server should start automatically when you use it
   - You can also manually run: `uvx blender-mcp` in a terminal

2. **Verify Add-on is Enabled:**
   - Go back to `Edit > Preferences > Add-ons`
   - Make sure "Interface: Blender MCP" has a checkmark ✓

3. **Check Blender Version:**
   - Make sure you're using Blender 3.0 or newer
   - Check version: `Help > About Blender`

4. **Restart Blender:**
   - Sometimes you need to restart Blender after installing/enabling the add-on

5. **Check for Error Messages:**
   - Look in Blender's console for error messages
   - Open console: `Window > Toggle System Console` (Windows)

---

## Visual Guide - What You Should See

### In Blender Preferences (Add-ons tab):
```
┌─────────────────────────────────────┐
│ Add-ons                              │
├─────────────────────────────────────┤
│ Search: [Blender MCP          ]     │
│                                     │
│ ☑ Interface: Blender MCP           │
│   Description: ...                  │
│                                     │
└─────────────────────────────────────┘
```

### In 3D Viewport Sidebar (BlenderMCP tab):
```
┌─────────────────────────────────────┐
│ BlenderMCP                           │
├─────────────────────────────────────┤
│ Status: Connected ✓                  │
│                                     │
│ ☐ Use Poly Haven Assets             │
│                                     │
│ [Disconnect]                         │
└─────────────────────────────────────┘
```

---

## Next Steps

Once connected:
1. The add-on is ready to receive commands from Cursor
2. You can now ask me to create 3D models in Blender
3. Try: "Create a cube in Blender" or "Add a sphere"

The connection should persist as long as:
- Blender is open
- The add-on is enabled
- Cursor's MCP server is running
