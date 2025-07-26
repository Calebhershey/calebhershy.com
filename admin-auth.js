// Shared Admin Authentication Functions for Grazin Acres

function checkAdminPrivileges(username) {
  // List of admin usernames - customize this list
  const adminUsers = ['admin', 'owner', 'manager', 'calebhershey'];
  const isAdmin = adminUsers.includes(username.toLowerCase()) || 
                  username.toLowerCase().includes('admin') ||
                  username.toLowerCase().includes('owner');
  
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn && isAdmin) {
    adminBtn.style.display = 'inline-block';
  }
  
  return isAdmin;
}

function checkAdminAccess() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const adminUsers = ['admin', 'owner', 'manager', 'calebhershey'];
  
  if (!loggedInUser) {
    alert('Please log in first to access admin features.');
    window.location.href = 'login.html';
    return;
  }
  
  const isAdmin = adminUsers.includes(loggedInUser.toLowerCase()) || 
                  loggedInUser.toLowerCase().includes('admin') ||
                  loggedInUser.toLowerCase().includes('owner');
  
  if (isAdmin) {
    // Set admin authentication token
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminUser', loggedInUser);
    window.location.href = 'admin-database.html';
  } else {
    // Prompt for admin password
    const adminPassword = prompt('Enter admin password:');
    // Change these passwords for security
    if (adminPassword === 'grazin2025' || adminPassword === 'admin123' || adminPassword === 'farmadmin') {
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminUser', loggedInUser);
      window.location.href = 'admin-database.html';
    } else {
      alert('Access denied. Invalid admin credentials.');
    }
  }
}

function logoutAdmin() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('adminUser');
  logout(); // Call the regular logout function
}

function initializeAdminButtons() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    checkAdminPrivileges(loggedInUser);
  }
}

// Add admin button to any page header
function addAdminButtonToHeader() {
  const headerButtons = document.querySelector('.header-buttons');
  const adminBtn = document.getElementById('admin-btn');
  
  if (headerButtons && !adminBtn) {
    const adminButton = document.createElement('button');
    adminButton.id = 'admin-btn';
    adminButton.onclick = checkAdminAccess;
    adminButton.style.cssText = 'background: #ff8c00; color: white; display: none;';
    adminButton.textContent = 'Admin';
    
    // Insert before login button
    const loginBtn = headerButtons.querySelector('button[onclick*="login.html"]');
    if (loginBtn) {
      headerButtons.insertBefore(adminButton, loginBtn);
    } else {
      headerButtons.appendChild(adminButton);
    }
  }
}

// Initialize admin functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  addAdminButtonToHeader();
  initializeAdminButtons();
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkAdminPrivileges,
    checkAdminAccess,
    logoutAdmin,
    initializeAdminButtons,
    addAdminButtonToHeader
  };
}
