# Installing Blender MCP Add-on

## Step 1: Download the Add-on

### Option A: Download from GitHub (Recommended)

1. **Go to the GitHub repository:**
   - Open your web browser
   - Go to: https://github.com/Gorav22/Blender-mcp

2. **Download the addon.py file:**
   - Click on the **`addon.py`** file in the repository
   - Click the **"Raw"** button (top right of the file view)
   - Right-click on the page and select **"Save As..."** or **"Save Page As..."**
   - Save it to an easy-to-find location (like your Desktop or Downloads folder)
   - Make sure it saves as `addon.py` (not `addon.py.txt`)

### Option B: Download the entire repository

1. Go to: https://github.com/Gorav22/Blender-mcp
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file
5. Find the `addon.py` file inside

---

## Step 2: Install in Blender

1. **Open Blender**

2. **Open Preferences:**
   - Go to **`Edit > Preferences`**
   - OR press **`Ctrl + Alt + U`**

3. **Go to Add-ons tab:**
   - Click on **"Add-ons"** in the left sidebar

4. **Install the add-on:**
   - Click the **"Install..."** button (top right of the window)
   - Navigate to where you saved `addon.py`
   - Select the `addon.py` file
   - Click **"Install Add-on"**

5. **Enable the add-on:**
   - After installation, you should see it in the list
   - Search for **"Blender MCP"** or **"MCP"** in the search box
   - Find **"Interface: Blender MCP"**
   - **Check the checkbox** ✓ next to it to enable it

---

## Step 3: Verify Installation

After enabling, you should see:
- The checkbox is checked ✓
- The add-on description is visible
- No error messages

---

## Step 4: Access the Add-on Panel

1. **Click in the 3D Viewport** (the main 3D view area)

2. **Open the Sidebar:**
   - Press **`N`** key
   - OR go to **`View > Sidebar`**

3. **Find the BlenderMCP tab:**
   - Look at the tabs at the top of the sidebar
   - You should now see a **"BlenderMCP"** tab
   - Click on it

4. **Connect:**
   - Click **"Connect to Claude"** or **"Connect to MCP"**
   - Wait for connection status

---

## Troubleshooting

### Can't find addon.py after downloading?
- Make sure you clicked "Raw" before saving
- Check your Downloads folder
- The file should be named exactly `addon.py`

### Add-on doesn't appear after installation?
- Make sure you clicked "Install Add-on" (not just selected the file)
- Check the search box - try searching for "Interface" or "Blender"
- Restart Blender and check again

### Getting an error when installing?
- Make sure you're using Blender 3.0 or newer
- Check Blender's console for error messages: `Window > Toggle System Console`

### BlenderMCP tab doesn't appear?
- Make sure the add-on is enabled (checkbox is checked)
- Restart Blender
- Make sure you're in the 3D Viewport (not other editors)
- Press `N` to toggle sidebar if it's not visible
