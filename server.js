const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const EmailService = require('./email-service');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize email service
const emailService = new EmailService();

let users = []; // In-memory users (use a database for real apps)
let orders = []; // In-memory orders (use a database for real apps)

// Simple admin authentication middleware
function adminAuth(req, res, next) {
  // In production, implement proper JWT or session-based auth
  const adminHeader = req.headers['x-admin-auth'];
  if (adminHeader === 'admin-authenticated') {
    next();
  } else {
    // For now, we'll skip authentication in development
    next(); // Remove this in production and uncomment below
    // res.status(401).json({ message: 'Admin authentication required' });
  }
}

app.post('/signup', (req, res) => {
  const { username, password, profile } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  // Validate required fields for enhanced signup
  if (!profile?.email || !profile?.firstName || !profile?.lastName) {
    return res.status(400).json({ message: 'Missing required profile information' });
  }
  
  // Check if signature is provided
  if (!profile?.signature) {
    return res.status(400).json({ message: 'Digital signature is required' });
  }
  
  // Check if user agreed to terms
  if (!profile?.agreementAccepted) {
    return res.status(400).json({ message: 'You must accept the membership agreement' });
  }
  
  // Create user with comprehensive profile data
  const newUser = {
    id: Date.now(), // Simple ID generation (use UUID in production)
    username,
    password,
    profile: {
      username: username,
      email: profile.email,
      fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || "",
      birthdate: profile.birthdate || "",
      address: profile.address || "",
      city: profile.city || "",
      zipcode: profile.zipcode || "",
      memberType: profile.memberType || "individual",
      interests: profile.interests || "",
      newsletterConsent: profile.newsletterConsent || false,
      signature: profile.signature,
      agreementAccepted: profile.agreementAccepted,
      agreementDate: profile.agreementDate || new Date().toISOString(),
      ageVerified: profile.ageVerified || false,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      location: `${profile.city || ""}, ${profile.zipcode || ""}`.trim().replace(/^,\s*|,\s*$/g, ''),
      farmerType: profile.farmerType || (profile.memberType === 'farmer' ? 'farmer' : 'buyer'),
      membershipStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  users.push(newUser);
  console.log('New member created:', newUser.id, newUser.username, 'Type:', newUser.profile.memberType);
  
  // Send email notifications
  (async () => {
    try {
      // Send admin notification
      await emailService.sendAdminMembershipNotification(newUser);
      console.log('Admin notification email sent for new member:', newUser.username);
      
      // For now, auto-approve and send welcome email
      // In production, you'd wait for admin approval
      setTimeout(async () => {
        try {
          await emailService.sendMembershipApproval(newUser);
          console.log('Welcome email sent to:', newUser.profile.email);
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      }, 2000); // Small delay for demo purposes
      
    } catch (error) {
      console.error('Error sending signup emails:', error);
    }
  })();
  
  res.json({ 
    message: 'Membership created successfully! Welcome to Grazin Acres.',
    userId: newUser.id,
    profile: newUser.profile
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Check if user has signed the agreement (for existing users)
    if (!user.profile.agreementAccepted) {
      return res.status(403).json({ 
        message: 'Please complete your membership agreement to access the site.',
        requiresAgreement: true
      });
    }
    
    // Generate a simple token (in production, use proper JWT)
    const token = `auth_${user.id}_${Date.now()}`;
    
    console.log('Login successful for member:', user.id, user.username, 'Type:', user.profile.memberType);
    res.json({ 
      message: `Welcome back, ${user.profile.firstName || user.username}!`,
      userId: user.id,
      profile: user.profile,
      token: token
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials. Please check your username and password.' });
  }
});

// Get user profile
app.get('/profile/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.json(user.profile);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Update user profile
app.put('/profile/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update profile fields
  const allowedFields = ['bio', 'avatarUrl', 'fullName', 'email', 'phone', 'location', 'farmerType'];
  const updates = req.body;
  
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      user.profile[field] = updates[field];
    }
  });
  
  user.profile.updatedAt = new Date().toISOString();
  
  res.json({ 
    message: 'Profile updated successfully',
    profile: user.profile
  });
});

app.post('/order', (req, res) => {
  console.log('Order received:', req.body);
  
  // Enhanced order structure
  const order = {
    id: Date.now(), // Simple ID generation
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  orders.push(order);
  
  // Send order confirmation email
  (async () => {
    try {
      const emailResult = await emailService.sendOrderConfirmation({
        customer: order.customer || order.name,
        email: order.email,
        cart: order.cart || [],
        total: order.total || order.grandTotal,
        delivery: order.delivery || { method: 'home', address: order.address },
        orderId: order.id
      });
      
      if (emailResult.success) {
        console.log('Order confirmation email sent for order:', order.id);
      } else {
        console.error('Failed to send order confirmation email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  })();
  
  res.json({ 
    message: 'Order received',
    orderId: order.id,
    status: order.status
  });
});

// For owner: get all orders
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Debug endpoint to see all users (remove in production)
app.get('/debug/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, profile: u.profile })));
});

// ADMIN ENDPOINTS
// Get all users for admin
app.get('/admin/users', (req, res) => {
  // In production, add admin authentication middleware here
  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    profile: u.profile
  }));
  res.json(userList);
});

// Get all orders for admin
app.get('/admin/orders', (req, res) => {
  // In production, add admin authentication middleware here
  const ordersWithIds = orders.map((order, index) => ({
    ...order,
    id: order.id || index + 1,
    status: order.status || 'pending',
    createdAt: order.createdAt || new Date().toISOString()
  }));
  res.json(ordersWithIds);
});

// Delete user (admin only)
app.delete('/admin/users/:userId', (req, res) => {
  // In production, add admin authentication middleware here
  const userId = parseInt(req.params.userId);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

// Update order status (admin only)
app.put('/admin/orders/:orderIndex/status', (req, res) => {
  // In production, add admin authentication middleware here
  const orderIndex = parseInt(req.params.orderIndex);
  const { status } = req.body;
  
  if (orderIndex < 0 || orderIndex >= orders.length) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  res.json({ 
    message: 'Order status updated successfully',
    order: orders[orderIndex]
  });
});

// Get admin analytics
app.get('/admin/analytics', (req, res) => {
  // In production, add admin authentication middleware here
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const buyers = users.filter(u => u.profile?.farmerType === 'buyer').length;
  const sellers = users.filter(u => u.profile?.farmerType === 'seller' || u.profile?.farmerType === 'both').length;
  
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.grandTotal || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const today = new Date().toDateString();
  const ordersToday = orders.filter(order => 
    order.date && new Date(order.date).toDateString() === today
  ).length;
  
  const analytics = {
    totalUsers,
    totalOrders,
    buyers,
    sellers,
    totalRevenue,
    avgOrderValue,
    ordersToday,
    pendingOrders: orders.filter(o => (o.status || 'pending') === 'pending').length
  };
  
  res.json(analytics);
});

// Get recent activity for admin dashboard
app.get('/admin/recent-activity', (req, res) => {
  const recentOrders = orders.slice(-10).reverse(); // Last 10 orders
  const recentUsers = users.slice(-5).reverse(); // Last 5 users
  
  const activity = {
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      customer: order.customer || order.name,
      total: order.total || order.grandTotal,
      date: order.createdAt || order.date,
      status: order.status || 'pending'
    })),
    recentUsers: recentUsers.map(user => ({
      id: user.id,
      username: user.username,
      joinDate: user.profile?.createdAt,
      type: user.profile?.farmerType
    }))
  };
  
  res.json(activity);
});

// Test email functionality
app.post('/admin/test-email', async (req, res) => {
  try {
    // Test connection first
    const connectionTest = await emailService.testEmailConnection();
    
    if (connectionTest.success) {
      try {
        // Send a test email
        const testEmailResult = await emailService.sendOrderStatusUpdate({
          customer: 'Test Customer',
          email: process.env.ADMIN_EMAIL || 'admin@grazinacres.com',
          orderId: 'TEST-' + Date.now()
        }, 'processing');
        
        res.json({ 
          message: 'Email test completed successfully',
          connectionTest: connectionTest,
          emailTest: {
            success: true,
            message: 'Test email sent successfully',
            messageId: testEmailResult.messageId
          }
        });
      } catch (emailError) {
        res.json({
          message: 'Connection successful but email send failed',
          connectionTest: connectionTest,
          emailTest: {
            success: false,
            error: emailError.message
          }
        });
      }
    } else {
      res.status(500).json({
        message: 'Email connection test failed',
        connectionTest: connectionTest,
        emailTest: {
          success: false,
          error: 'Cannot send email due to connection failure'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Email test failed',
      error: error.message,
      connectionTest: {
        success: false,
        error: error.message
      },
      emailTest: {
        success: false,
        error: 'Test could not be completed'
      }
    });
  }
});

// Update order status with email notification
app.put('/admin/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id == orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (!['pending', 'processing', 'ready', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  const oldStatus = orders[orderIndex].status;
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // Send status update email if status changed and email exists
  if (oldStatus !== status && orders[orderIndex].email) {
    try {
      await emailService.sendOrderStatusUpdate(orders[orderIndex], status);
      console.log(`Status update email sent for order ${orderId}: ${status}`);
    } catch (error) {
      console.error(`Failed to send status update email for order ${orderId}:`, error);
    }
  }
  
  res.json({ 
    message: 'Order status updated successfully',
    order: orders[orderIndex]
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));