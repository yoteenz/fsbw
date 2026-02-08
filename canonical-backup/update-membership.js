// Script to update Kateena Armstrong's account to Premium membership
// Run this in the browser console when signed in as Kateena Armstrong

(function() {
  try {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      console.log('No current user found. Please sign in first.');
      return;
    }
    
    const currentUser = JSON.parse(currentUserStr);
    
    // Check if this is Kateena Armstrong (case-insensitive email check)
    const email = currentUser.email?.toLowerCase() || '';
    const firstName = currentUser.firstName?.toLowerCase() || '';
    const lastName = currentUser.lastName?.toLowerCase() || '';
    
    const isKateena = email.includes('kateena') || 
                     (firstName.includes('kateena') && lastName.includes('armstrong')) ||
                     email.includes('armstrong');
    
    if (!isKateena) {
      console.log('Current user is not Kateena Armstrong. Current user:', currentUser.email || currentUser.firstName + ' ' + currentUser.lastName);
      console.log('To update Kateena Armstrong, please sign in with her account first.');
      return;
    }
    
    // Update membership type to PREMIUM
    currentUser.membershipType = 'PREMIUM';
    
    // Update currentUser in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in registeredUsers list
    const registeredUsersStr = localStorage.getItem('registeredUsers');
    if (registeredUsersStr) {
      const registeredUsers = JSON.parse(registeredUsersStr);
      const userIndex = registeredUsers.findIndex((u: any) => 
        u.email?.toLowerCase() === email || 
        (u.firstName?.toLowerCase() === firstName && u.lastName?.toLowerCase() === lastName)
      );
      
      if (userIndex !== -1) {
        registeredUsers[userIndex].membershipType = 'PREMIUM';
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('Updated Kateena Armstrong to PREMIUM membership in registeredUsers list.');
      }
    }
    
    console.log('✅ Successfully updated Kateena Armstrong to PREMIUM membership!');
    console.log('Please refresh the page to see the CONCIERGE tab.');
    
  } catch (error) {
    console.error('Error updating membership:', error);
  }
})();

