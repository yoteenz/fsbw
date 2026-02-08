// Run this in browser console while signed in as Kateena Armstrong
// This will update the account to PREMIUM membership

(function() {
  try {
    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      console.log('❌ No user signed in. Please sign in as Kateena Armstrong first.');
      return;
    }
    
    const currentUser = JSON.parse(currentUserStr);
    console.log('Current user:', currentUser.email || currentUser.firstName + ' ' + currentUser.lastName);
    console.log('Current membership:', currentUser.membershipType || 'STANDARD');
    
    // Update membership type to PREMIUM
    currentUser.membershipType = 'PREMIUM';
    
    // Update currentUser in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('✅ Updated currentUser to PREMIUM');
    
    // Also update in registeredUsers list
    const registeredUsersStr = localStorage.getItem('registeredUsers');
    if (registeredUsersStr) {
      const registeredUsers = JSON.parse(registeredUsersStr);
      const userIndex = registeredUsers.findIndex(u => 
        u.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
        (u.firstName?.toLowerCase() === currentUser.firstName?.toLowerCase() && 
         u.lastName?.toLowerCase() === currentUser.lastName?.toLowerCase())
      );
      
      if (userIndex !== -1) {
        registeredUsers[userIndex].membershipType = 'PREMIUM';
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('✅ Updated in registeredUsers list too!');
      } else {
        console.log('⚠️ User not found in registeredUsers list');
      }
    }
    
    console.log('✅ Successfully updated to PREMIUM membership!');
    console.log('🔄 Please refresh the page to see PREMIUM REWARDS and CONCIERGE tab.');
    
    // Verify the update
    const verifyUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Verification - New membership:', verifyUser.membershipType);
    
  } catch (error) {
    console.error('❌ Error updating membership:', error);
  }
})();

