# Blender MCP Setup Guide

This guide will walk you through setting up Blender MCP (Model Context Protocol) so you can use AI to create 3D models in Blender.

## Prerequisites

- **Blender 3.0 or newer** - Download from [blender.org](https://www.blender.org/download/)
- **Python 3.10 or newer** (usually comes with Blender)
- **uv package manager** (we'll install this)

---

## Step 1: Install the `uv` Package Manager

Since you're on Windows, run this command in PowerShell:

```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

After installation, you may need to add `uv` to your PATH. Run this in PowerShell:

```powershell
$localBin = "$env:USERPROFILE\.local\bin"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;$localBin", "User")
```

**Important:** Close and reopen your terminal/PowerShell after this step so PATH changes take effect.

Verify installation:
```powershell
uv --version
```

---

## Step 2: Install the Blender MCP Server

Once `uv` is installed, install the Blender MCP server:

```powershell
uvx blender-mcp
```

This will download and set up the MCP server. You may need to run this command each time, or you can configure it in Cursor settings.

---

## Step 3: Install the Blender Add-on

1. **Download the add-on:**
   - Go to: https://github.com/Gorav22/Blender-mcp
   - Download the `addon.py` file (or clone the repository)

2. **Install in Blender:**
   - Open Blender
   - Go to `Edit > Preferences > Add-ons`
   - Click "Install..." button
   - Select the downloaded `addon.py` file
   - Enable the add-on by checking the box next to **"Interface: Blender MCP"**

---

## Step 4: Configure Cursor MCP Settings

1. **Open Cursor Settings:**
   - Press `Ctrl + ,` (or go to `File > Preferences > Settings`)
   - Search for "MCP" in the settings search bar
   - Or navigate to `Settings > MCP`

2. **Add the Blender MCP Server:**
   - Click "Add Server" or "Add MCP Server"
   - Configure it with these settings:

   **Option A: Using uvx directly (Recommended)**
   ```json
   {
     "mcpServers": {
       "blender": {
         "command": "uvx",
         "args": ["blender-mcp"]
       }
     }
   }
   ```

   **Option B: If Option A doesn't work on Windows, try:**
   ```json
   {
     "mcpServers": {
       "blender": {
         "command": "cmd",
         "args": ["/c", "uvx", "blender-mcp"]
       }
     }
   }
   ```

3. **Save the configuration** and restart Cursor if needed.

---

## Step 5: Start the Connection in Blender

1. **Open Blender**

2. **Open the 3D View sidebar:**
   - Press `N` key in the 3D Viewport
   - Or go to `View > Sidebar`

3. **Navigate to the BlenderMCP tab:**
   - Look for the "BlenderMCP" tab in the sidebar

4. **Configure options:**
   - If you want to use assets from Poly Haven, enable the checkbox
   - Click **"Connect to Claude"** (or "Connect to MCP")

5. **Verify connection:**
   - The add-on should show a connection status
   - Make sure the MCP server is running (you may need to keep a terminal open with `uvx blender-mcp`)

---

## Step 6: Test the Integration

Once everything is set up:

1. Make sure Blender is open and connected
2. In Cursor, try asking me to create a simple 3D model
3. I should be able to send commands to Blender through the MCP protocol

---

## Troubleshooting

### `uv` command not found
- Make sure you added it to PATH and restarted your terminal
- Try using the full path: `$env:USERPROFILE\.local\bin\uv.exe`

### MCP server not connecting
- Make sure Blender is open and the add-on is enabled
- Check that you clicked "Connect to Claude" in Blender
- Verify the MCP server configuration in Cursor settings
- Try running `uvx blender-mcp` manually in a terminal to see any error messages

### Blender add-on not appearing
- Make sure you enabled it in `Edit > Preferences > Add-ons`
- Check that you're using Blender 3.0 or newer
- Try restarting Blender after installation

---

## Resources

- **Blender MCP Repository:** https://github.com/Gorav22/Blender-mcp
- **Blender Download:** https://www.blender.org/download/
- **uv Package Manager:** https://github.com/astral-sh/uv

---

## Next Steps

Once set up, you can ask me things like:
- "Create a cube in Blender"
- "Add a sphere with a material"
- "Model a simple chair"
- "Add lighting to the scene"

I'll be able to send commands directly to Blender through the MCP protocol!
