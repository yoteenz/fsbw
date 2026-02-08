# Update Kateena Armstrong to Premium Membership

To make Kateena Armstrong's account premium so the CONCIERGE tab appears, run this code in your browser console:

## Steps:

1. Sign in as Kateena Armstrong
2. Open browser console (F12 or right-click > Inspect > Console)
3. Copy and paste this code:

```javascript
// Update Kateena Armstrong to Premium Membership
try {
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    console.log('No user signed in. Please sign in as Kateena Armstrong first.');
  } else {
    const currentUser = JSON.parse(currentUserStr);
    currentUser.membershipType = 'PREMIUM';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in registeredUsers
    const registeredUsersStr = localStorage.getItem('registeredUsers');
    if (registeredUsersStr) {
      const registeredUsers = JSON.parse(registeredUsersStr);
      const userIndex = registeredUsers.findIndex(u => 
        u.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (userIndex !== -1) {
        registeredUsers[userIndex].membershipType = 'PREMIUM';
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
    }
    
    console.log('✅ Updated to PREMIUM membership! Refresh the page to see CONCIERGE tab.');
  }
} catch (error) {
  console.error('Error:', error);
}
```

4. Press Enter to run
5. Refresh the page - the CONCIERGE tab should now appear!

