# Step-by-Step: Adding Blender MCP Server in Cursor

## Method 1: Using Cursor Settings UI (Recommended)

### Step 1: Open Cursor Settings
1. **Press `Ctrl + ,`** (Control + Comma)
   - OR go to **File > Preferences > Settings**
   - OR click the gear icon ⚙️ in the bottom left corner

### Step 2: Navigate to MCP Settings
1. In the settings search bar at the top, type: **"MCP"**
2. Look for **"MCP"** or **"Model Context Protocol"** in the settings list
3. Click on it to expand MCP settings

### Step 3: Add New Server
1. Look for a button that says:
   - **"Add Server"**
   - **"Add MCP Server"**
   - **"+"** button
   - Or a section that says **"MCP Servers"** with an **"Add"** option

2. Click the **"Add"** or **"+"** button

### Step 4: Fill in the Server Configuration
You'll see a form or JSON editor. Enter the following:

**Server Name/ID:**
```
blender
```

**Command:**
```
uvx
```

**Arguments/Args:**
```
blender-mcp
```

**OR if it's a JSON editor, paste this:**
```json
{
  "command": "uvx",
  "args": ["blender-mcp"]
}
```

### Step 5: Save
- Click **"Save"** or **"OK"**
- The server should now appear in your MCP servers list

---

## Method 2: Edit Configuration File Directly

If the UI method doesn't work, you can edit the configuration file directly:

### Step 1: Find Cursor's Config File Location
On Windows, Cursor's config is typically at:
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

OR it might be at:
```
%APPDATA%\Cursor\User\settings.json
```

### Step 2: Open the Config File
1. Press `Win + R` to open Run dialog
2. Type: `%APPDATA%\Cursor`
3. Navigate to find the MCP settings file
4. Open it in a text editor (or in Cursor itself)

### Step 3: Add the Configuration
Add or update the `mcpServers` section:

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

**If the file already has other servers, add "blender" to the existing object:**
```json
{
  "mcpServers": {
    "existing-server": { ... },
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

### Step 4: Save and Restart
1. Save the file
2. Restart Cursor completely

---

## Method 3: Using Command Palette

1. Press **`Ctrl + Shift + P`** to open Command Palette
2. Type: **"MCP"** or **"Model Context Protocol"**
3. Look for commands like:
   - **"MCP: Add Server"**
   - **"MCP: Configure Servers"**
   - **"MCP: Edit Settings"**
4. Select the appropriate command and follow the prompts

---

## Verification

After adding the server:

1. **Check MCP Status:**
   - Look for an MCP icon or indicator in Cursor's status bar
   - Or check the MCP settings page - you should see "blender" listed

2. **Test the Connection:**
   - Make sure Blender is open with the add-on connected
   - Try asking me to create something in Blender
   - If it works, you'll see commands being sent to Blender!

---

## Troubleshooting

### Can't find MCP settings?
- Make sure you're using a recent version of Cursor
- Try updating Cursor to the latest version
- MCP might be in **Settings > Features > MCP** or similar

### Server not connecting?
- Make sure `uvx` is in your PATH (restart Cursor after installing `uv`)
- Try the alternative command format:
  ```json
  {
    "command": "cmd",
    "args": ["/c", "uvx", "blender-mcp"]
  }
  ```

### Still having issues?
- Check Cursor's output/logs for error messages
- Make sure Blender is running and the add-on is connected
- Verify `uvx blender-mcp` works when run manually in a terminal
