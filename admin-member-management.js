// Admin Member Management JavaScript
class MemberManager {
  constructor() {
    this.apiUrl = 'http://localhost:3000';
    this.members = [];
    this.products = JSON.parse(localStorage.getItem('admin_products')) || this.getDefaultProducts();
    this.orders = [];
    this.currentMember = null;
    this.currentCart = [];
    this.taxRate = 0.0825; // 8.25%
  }

  init() {
    this.loadMembers();
    this.loadOrders();
  }

  getDefaultProducts() {
    return [
      {
        id: 1,
        name: "Farm Fresh Eggs",
        category: "eggs",
        price: 6.00,
        stock: 24,
        unit: "dozen",
        description: "Free-range eggs from happy hens",
        status: "active",
        image: "images (4).jpeg"
      },
      {
        id: 2,
        name: "Raw Local Honey",
        category: "honey",
        price: 12.00,
        stock: 15,
        unit: "each",
        description: "Pure, unfiltered honey from our bees",
        status: "active",
        image: "230511_LightorDarkBrownSugar_ddmfs_4x3_2404-8bd53810c76d4ac1b2db0cd83e7fb88a.jpg"
      },
      {
        id: 3,
        name: "Heirloom Tomatoes",
        category: "vegetables",
        price: 8.50,
        stock: 30,
        unit: "lb",
        description: "Colorful, chemical-free heirloom tomatoes",
        status: "active",
        image: "images (3).jpeg"
      },
      {
        id: 4,
        name: "Fresh Milk",
        category: "dairy",
        price: 5.50,
        stock: 12,
        unit: "gallon",
        description: "Fresh whole milk from grass-fed cows",
        status: "active",
        image: "images (1).jpeg"
      },
      {
        id: 5,
        name: "Organic Cheese",
        category: "dairy",
        price: 15.00,
        stock: 8,
        unit: "each",
        description: "Artisan cheese made on-site",
        status: "active",
        image: "swiss-cheese-header_2.jpg"
      },
      {
        id: 6,
        name: "Grass-Fed Beef",
        category: "meat",
        price: 18.50,
        stock: 15,
        unit: "lb",
        description: "Premium grass-fed beef cuts",
        status: "active",
        image: "beef.jpg"
      },
      {
        id: 7,
        name: "Free-Range Chicken",
        category: "meat",
        price: 12.00,
        stock: 10,
        unit: "lb",
        description: "Free-range chicken, locally raised",
        status: "active",
        image: "chicken.jpg"
      }
    ];
  }

  async loadMembers() {
    try {
      const response = await fetch(`${this.apiUrl}/debug/users`);
      if (response.ok) {
        this.members = await response.json();
      } else {
        // Fallback to sample data
        this.members = this.getSampleMembers();
      }
    } catch (error) {
      console.error('Error loading members:', error);
      this.members = this.getSampleMembers();
    }
    
    // Save members to localStorage for POS system access
    localStorage.setItem('admin_customers', JSON.stringify(this.members));
    
    this.displayMembers();
  }

  async loadOrders() {
    try {
      const response = await fetch(`${this.apiUrl}/orders`);
      if (response.ok) {
        this.orders = await response.json();
      } else {
        this.orders = this.getSampleOrders();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      this.orders = this.getSampleOrders();
    }
  }

  getSampleMembers() {
    return [
      {
        id: 1,
        username: 'john_smith',
        profile: {
          fullName: 'John Smith',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          address: '123 Main Street',
          city: 'Farmville',
          zipcode: '12345',
          memberType: 'family',
          customerGroup: 'standard',
          status: 'active',
          joinDate: '2024-01-15',
          lastLogin: '2025-01-20',
          totalOrders: 8,
          totalSpent: 245.50,
          interests: 'Organic vegetables and fresh dairy products'
        }
      },
      {
        id: 2,
        username: 'sarah_restaurant',
        profile: {
          fullName: 'Sarah Johnson',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@freshbistro.com',
          phone: '(555) 234-5678',
          address: '456 Business Ave',
          city: 'Downtown',
          zipcode: '12346',
          memberType: 'business',
          customerGroup: 'business',
          status: 'active',
          joinDate: '2024-02-20',
          lastLogin: '2025-01-22',
          totalOrders: 15,
          totalSpent: 890.25,
          interests: 'Bulk orders for restaurant, seasonal vegetables'
        }
      },
      {
        id: 3,
        username: 'mike_farmer',
        profile: {
          fullName: 'Mike Wilson',
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.wilson@email.com',
          phone: '(555) 345-6789',
          address: '789 Country Road',
          city: 'Farmland',
          zipcode: '12347',
          memberType: 'farmer',
          customerGroup: 'farmer',
          status: 'active',
          joinDate: '2024-03-10',
          lastLogin: '2025-01-21',
          totalOrders: 5,
          totalSpent: 125.75,
          interests: 'Supporting local farm network, buying feed supplies'
        }
      },
      {
        id: 4,
        username: 'lisa_premium',
        profile: {
          fullName: 'Lisa Chen',
          firstName: 'Lisa',
          lastName: 'Chen',
          email: 'lisa.chen@email.com',
          phone: '(555) 456-7890',
          address: '321 Premium Lane',
          city: 'Uptown',
          zipcode: '12348',
          memberType: 'individual',
          customerGroup: 'premium',
          status: 'active',
          joinDate: '2024-01-05',
          lastLogin: '2025-01-23',
          totalOrders: 22,
          totalSpent: 1250.00,
          interests: 'Premium organic products, artisanal items'
        }
      },
      {
        id: 5,
        username: 'david_baker',
        profile: {
          fullName: 'David Baker',
          firstName: 'David',
          lastName: 'Baker',
          email: 'david@sweetthings.com',
          phone: '(555) 567-8901',
          address: '654 Bakery Street',
          city: 'Sweetville',
          zipcode: '12349',
          memberType: 'business',
          customerGroup: 'business',
          status: 'active',
          joinDate: '2024-04-12',
          lastLogin: '2025-01-24',
          totalOrders: 12,
          totalSpent: 567.80,
          interests: 'Flour, eggs, dairy for bakery operations'
        }
      },
      {
        id: 6,
        username: 'maria_family',
        profile: {
          fullName: 'Maria Garcia',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@email.com',
          phone: '(555) 678-9012',
          address: '987 Family Road',
          city: 'Hometown',
          zipcode: '12350',
          memberType: 'family',
          customerGroup: 'standard',
          status: 'active',
          joinDate: '2024-05-08',
          lastLogin: '2025-01-23',
          totalOrders: 6,
          totalSpent: 189.40,
          interests: 'Fresh produce, eggs, and seasonal items'
        }
      },
      {
        id: 7,
        username: 'robert_organic',
        profile: {
          fullName: 'Robert Thompson',
          firstName: 'Robert',
          lastName: 'Thompson',
          email: 'robert.thompson@email.com',
          phone: '(555) 789-0123',
          address: '147 Organic Way',
          city: 'Greenfield',
          zipcode: '12351',
          memberType: 'individual',
          customerGroup: 'premium',
          status: 'active',
          joinDate: '2024-03-22',
          lastLogin: '2025-01-22',
          totalOrders: 18,
          totalSpent: 892.15,
          interests: 'Certified organic products only, health-conscious'
        }
      },
      {
        id: 8,
        username: 'amy_senior',
        profile: {
          fullName: 'Amy Patterson',
          firstName: 'Amy',
          lastName: 'Patterson',
          email: 'amy.patterson@email.com',
          phone: '(555) 890-1234',
          address: '258 Retirement Lane',
          city: 'Peaceful',
          zipcode: '12352',
          memberType: 'senior',
          customerGroup: 'senior',
          status: 'active',
          joinDate: '2024-06-15',
          lastLogin: '2025-01-21',
          totalOrders: 4,
          totalSpent: 98.60,
          interests: 'Small quantities, easy preparation items'
        }
      },
      {
        id: 9,
        username: 'carlos_chef',
        profile: {
          fullName: 'Carlos Rodriguez',
          firstName: 'Carlos',
          lastName: 'Rodriguez',
          email: 'carlos@finedining.com',
          phone: '(555) 901-2345',
          address: '369 Chef Boulevard',
          city: 'Culinary City',
          zipcode: '12353',
          memberType: 'business',
          customerGroup: 'business',
          status: 'active',
          joinDate: '2024-02-28',
          lastLogin: '2025-01-24',
          totalOrders: 25,
          totalSpent: 1456.75,
          interests: 'Premium cuts, specialty items, seasonal ingredients'
        }
      },
      {
        id: 10,
        username: 'jennifer_health',
        profile: {
          fullName: 'Jennifer White',
          firstName: 'Jennifer',
          lastName: 'White',
          email: 'jennifer.white@email.com',
          phone: '(555) 012-3456',
          address: '741 Wellness Street',
          city: 'Healthy Hills',
          zipcode: '12354',
          memberType: 'individual',
          customerGroup: 'standard',
          status: 'active',
          joinDate: '2024-07-03',
          lastLogin: '2025-01-23',
          totalOrders: 9,
          totalSpent: 312.85,
          interests: 'Gluten-free, organic, non-GMO products'
        }
      },
      {
        id: 11,
        username: 'michael_family',
        profile: {
          fullName: 'Michael Brown',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@email.com',
          phone: '(555) 123-7890',
          address: '852 Suburban Drive',
          city: 'Family Town',
          zipcode: '12355',
          memberType: 'family',
          customerGroup: 'standard',
          status: 'active',
          joinDate: '2024-08-10',
          lastLogin: '2025-01-22',
          totalOrders: 7,
          totalSpent: 224.30,
          interests: 'Bulk family packs, kid-friendly items'
        }
      },
      {
        id: 12,
        username: 'susan_vegan',
        profile: {
          fullName: 'Susan Green',
          firstName: 'Susan',
          lastName: 'Green',
          email: 'susan.green@email.com',
          phone: '(555) 234-8901',
          address: '963 Plant Street',
          city: 'Veggieville',
          zipcode: '12356',
          memberType: 'individual',
          customerGroup: 'premium',
          status: 'active',
          joinDate: '2024-09-05',
          lastLogin: '2025-01-24',
          totalOrders: 11,
          totalSpent: 445.20,
          interests: 'Vegan products, plant-based alternatives'
        }
      }
    ];
  }

  getSampleOrders() {
    return [
      {
        id: 1001,
        userId: 1,
        customer: "John Smith",
        email: "john.smith@email.com",
        date: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
        items: [
          { productId: 1, name: "Farm Fresh Eggs", quantity: 2, price: 6.00, unit: "dozen" },
          { productId: 3, name: "Heirloom Tomatoes", quantity: 1.5, price: 8.50, unit: "lb" }
        ],
        total: 24.75,
        address: "123 Main Street, Farmville, TX 12345"
      },
      {
        id: 1002,
        userId: 2,
        customer: "Sarah Johnson",
        email: "sarah@freshbistro.com",
        date: new Date(Date.now() - 172800000).toISOString(),
        status: "completed",
        items: [
          { productId: 3, name: "Heirloom Tomatoes", quantity: 5, price: 8.50, unit: "lb" },
          { productId: 4, name: "Fresh Milk", quantity: 3, price: 5.50, unit: "gallon" },
          { productId: 6, name: "Grass-Fed Beef", quantity: 2, price: 18.50, unit: "lb" }
        ],
        total: 95.00,
        address: "456 Business Ave, Downtown, TX 12346"
      },
      {
        id: 1003,
        userId: 1,
        customer: "John Smith",
        email: "john.smith@email.com",
        date: new Date(Date.now() - 259200000).toISOString(),
        status: "completed",
        items: [
          { productId: 2, name: "Raw Local Honey", quantity: 1, price: 12.00, unit: "each" },
          { productId: 5, name: "Organic Cheese", quantity: 1, price: 15.00, unit: "each" }
        ],
        total: 27.00,
        address: "123 Main Street, Farmville, TX 12345"
      },
      {
        id: 1004,
        userId: 4,
        customer: "Lisa Chen",
        email: "lisa.chen@email.com",
        date: new Date(Date.now() - 345600000).toISOString(),
        status: "completed",
        items: [
          { productId: 1, name: "Farm Fresh Eggs", quantity: 3, price: 6.00, unit: "dozen" },
          { productId: 2, name: "Raw Local Honey", quantity: 2, price: 12.00, unit: "each" },
          { productId: 5, name: "Organic Cheese", quantity: 2, price: 15.00, unit: "each" },
          { productId: 6, name: "Grass-Fed Beef", quantity: 1.5, price: 18.50, unit: "lb" }
        ],
        total: 89.75,
        address: "321 Premium Lane, Uptown, TX 12348"
      }
    ];
  }

  displayMembers() {
    const membersGrid = document.getElementById('members-grid');
    
    if (this.members.length === 0) {
      membersGrid.innerHTML = '<div class="no-results">No members found.</div>';
      return;
    }

    const membersHtml = this.members.map(member => {
      const profile = member.profile || {};
      const statusClass = `status-${profile.status || 'active'}`;
      
      return `
        <div class="member-card">
          <h3>${profile.fullName || member.username}</h3>
          <div class="member-status ${statusClass}">
            ${(profile.status || 'active').toUpperCase()}
          </div>
          <div class="member-info">
            <p><strong>Username:</strong> ${member.username}</p>
            <p><strong>Email:</strong> ${profile.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${profile.phone || 'N/A'}</p>
            <p><strong>Member Type:</strong> ${this.getMemberTypeLabel(profile.memberType)}</p>
            <p><strong>Customer Group:</strong> ${this.getCustomerGroupLabel(profile.customerGroup)}</p>
            <p><strong>Total Orders:</strong> ${profile.totalOrders || 0}</p>
            <p><strong>Total Spent:</strong> $${(profile.totalSpent || 0).toFixed(2)}</p>
            <p><strong>Last Login:</strong> ${profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</p>
          </div>
          <div style="margin-top: 15px;">
            <button class="btn btn-primary" onclick="memberManager.viewMemberProfile(${member.id})">
              👤 View Profile
            </button>
            <button class="btn btn-success" onclick="memberManager.startShopping(${member.id})">
              🛒 Shop for Member
            </button>
          </div>
        </div>
      `;
    }).join('');

    membersGrid.innerHTML = membersHtml;
  }

  getMemberTypeLabel(type) {
    const labels = {
      'individual': 'Individual',
      'family': 'Family',
      'business': 'Business',
      'farmer': 'Farmer'
    };
    return labels[type] || type || 'Individual';
  }

  getCustomerGroupLabel(group) {
    const labels = {
      'standard': 'Standard',
      'premium': 'Premium',
      'business': 'Business',
      'farmer': 'Farmer Network',
      'wholesale': 'Wholesale'
    };
    return labels[group] || group || 'Standard';
  }

  searchMembers(query) {
    if (!query.trim()) {
      this.displayMembers();
      return;
    }

    const filteredMembers = this.members.filter(member => {
      const profile = member.profile || {};
      const searchText = query.toLowerCase();
      
      return (
        member.username.toLowerCase().includes(searchText) ||
        (profile.fullName || '').toLowerCase().includes(searchText) ||
        (profile.email || '').toLowerCase().includes(searchText) ||
        (profile.customerGroup || '').toLowerCase().includes(searchText) ||
        (profile.memberType || '').toLowerCase().includes(searchText)
      );
    });

    const originalMembers = this.members;
    this.members = filteredMembers;
    this.displayMembers();
    this.members = originalMembers;
  }

  filterByStatus(status) {
    if (!status) {
      this.displayMembers();
      return;
    }

    const filteredMembers = this.members.filter(member => {
      const profile = member.profile || {};
      return (profile.status || 'active') === status;
    });

    const originalMembers = this.members;
    this.members = filteredMembers;
    this.displayMembers();
    this.members = originalMembers;
  }

  viewMemberProfile(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return;

    this.currentMember = member;
    this.currentCart = [];
    
    const profileHtml = this.generateProfileHtml(member);
    document.getElementById('profile-container').innerHTML = profileHtml;
    
    // Show profile section and update navigation
    document.getElementById('profile-nav').style.display = 'block';
    showSection('member-profile');
    
    // Load member's order history
    this.displayMemberOrders(memberId);
  }

  generateProfileHtml(member) {
    const profile = member.profile || {};
    
    return `
      <div class="profile-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2>${profile.fullName || member.username}</h2>
            <p style="opacity: 0.9; margin: 5px 0;">@${member.username} • ${this.getCustomerGroupLabel(profile.customerGroup)}</p>
            <div class="member-status status-${profile.status || 'active'}" style="margin-top: 10px;">
              ${(profile.status || 'active').toUpperCase()}
            </div>
          </div>
          <div style="text-align: right;">
            <button class="btn btn-warning" onclick="memberManager.editMember(${member.id})">
              ✏️ Edit Member
            </button>
            <button class="btn btn-secondary" onclick="showSection('member-search')">
              ← Back to Search
            </button>
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="tab active" onclick="memberManager.showTab('info')">📋 Information</div>
        <div class="tab" onclick="memberManager.showTab('orders')">📦 Order History</div>
        <div class="tab" onclick="memberManager.showTab('shopping')">🛒 Add Order</div>
      </div>

      <div class="tab-content">
        <div id="info-tab" class="tab-panel active">
          ${this.generateInfoTab(member)}
        </div>
        <div id="orders-tab" class="tab-panel" style="display: none;">
          ${this.generateOrdersTab(member)}
        </div>
        <div id="shopping-tab" class="tab-panel" style="display: none;">
          ${this.generateShoppingTab(member)}
        </div>
      </div>
    `;
  }

  generateInfoTab(member) {
    const profile = member.profile || {};
    
    return `
      <div class="profile-grid">
        <div class="info-section">
          <h4>Personal Information</h4>
          <p><strong>Full Name:</strong> ${profile.fullName || 'N/A'}</p>
          <p><strong>Email:</strong> ${profile.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${profile.phone || 'N/A'}</p>
          <p><strong>Address:</strong> ${profile.address || 'N/A'}</p>
          <p><strong>City:</strong> ${profile.city || 'N/A'}</p>
          <p><strong>ZIP Code:</strong> ${profile.zipcode || 'N/A'}</p>
          <p><strong>Join Date:</strong> ${profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Last Login:</strong> ${profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</p>
        </div>
        
        <div class="info-section">
          <h4>Membership Details</h4>
          <p><strong>Member Type:</strong> ${this.getMemberTypeLabel(profile.memberType)}</p>
          <p><strong>Customer Group:</strong> ${this.getCustomerGroupLabel(profile.customerGroup)}</p>
          <p><strong>Status:</strong> ${(profile.status || 'active').toUpperCase()}</p>
          <p><strong>Total Orders:</strong> ${profile.totalOrders || 0}</p>
          <p><strong>Total Spent:</strong> $${(profile.totalSpent || 0).toFixed(2)}</p>
          <p><strong>Average Order:</strong> $${profile.totalOrders ? ((profile.totalSpent || 0) / profile.totalOrders).toFixed(2) : '0.00'}</p>
        </div>
      </div>
      
      <div class="info-section">
        <h4>Interests & Notes</h4>
        <p>${profile.interests || 'No interests specified'}</p>
      </div>
    `;
  }

  generateOrdersTab(member) {
    return `
      <div id="member-orders-container">
        <p>Loading order history...</p>
      </div>
    `;
  }

  generateShoppingTab(member) {
    return `
      <div class="cart-section">
        <h3>🛒 Add Items to ${member.profile?.fullName || member.username}'s Cart</h3>
        <p>Select products and quantities to add to this member's cart, then checkout on their behalf.</p>
        
        <div class="product-selector">
          <select id="product-select">
            <option value="">Select a product...</option>
            ${this.products.filter(p => p.status === 'active').map(product => 
              `<option value="${product.id}">${product.name} - $${product.price.toFixed(2)}/${product.unit}</option>`
            ).join('')}
          </select>
          <input type="number" id="quantity-input" placeholder="Quantity" min="0.1" step="0.1">
          <span id="unit-display">units</span>
          <button class="btn btn-success" onclick="memberManager.addToCart()">Add to Cart</button>
        </div>
        
        <div class="cart-items" id="cart-items">
          <h4>Current Cart (0 items)</h4>
          <div id="cart-list">
            <p style="text-align: center; color: #666; font-style: italic;">Cart is empty</p>
          </div>
        </div>
        
        <div class="cart-total" id="cart-total" style="display: none;">
          <div>Total: $0.00</div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button class="btn btn-primary" id="checkout-btn" onclick="memberManager.proceedToCheckout()" style="display: none; padding: 15px 30px; font-size: 1.1em;">
            💳 Proceed to Checkout
          </button>
          <button class="btn btn-danger" onclick="memberManager.clearCart()" style="display: none; margin-left: 10px;" id="clear-cart-btn">
            🗑️ Clear Cart
          </button>
        </div>
      </div>
    `;
  }

  displayMemberOrders(memberId) {
    const memberOrders = this.orders.filter(order => order.userId === memberId);
    
    const ordersHtml = memberOrders.length > 0 ? `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${memberOrders.map(order => `
            <tr>
              <td>#${order.id}</td>
              <td>${new Date(order.date).toLocaleDateString()}</td>
              <td>${order.items ? order.items.length : 0} items</td>
              <td>$${(order.total || 0).toFixed(2)}</td>
              <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
              <td>
                <button class="btn btn-primary" onclick="memberManager.viewOrderDetails(${order.id})">View Details</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="text-align: center; color: #666; font-style: italic;">No orders found for this member.</p>';

    document.getElementById('member-orders-container').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3>Order History (${memberOrders.length} orders)</h3>
        <div>
          <span style="font-weight: bold; color: #2e8b57;">
            Total Spent: $${memberOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>
      ${ordersHtml}
    `;
  }

  showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    
    // Add active class to selected tab
    event.target.classList.add('active');
    
    // Special handling for orders tab
    if (tabName === 'orders' && this.currentMember) {
      this.displayMemberOrders(this.currentMember.id);
    }
  }

  startShopping(memberId) {
    this.viewMemberProfile(memberId);
    setTimeout(() => {
      this.showTab('shopping');
      // Manually trigger tab switch since we're calling it programmatically
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab')[2].classList.add('active');
    }, 100);
  }

  addToCart() {
    const productSelect = document.getElementById('product-select');
    const quantityInput = document.getElementById('quantity-input');
    
    const productId = parseInt(productSelect.value);
    const quantity = parseFloat(quantityInput.value);
    
    if (!productId || !quantity || quantity <= 0) {
      alert('Please select a product and enter a valid quantity.');
      return;
    }
    
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      alert('Product not found.');
      return;
    }
    
    if (quantity > product.stock) {
      alert(`Sorry, only ${product.stock} ${product.unit} available in stock.`);
      return;
    }
    
    // Check if item already in cart
    const existingItem = this.currentCart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.currentCart.push({
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        unit: product.unit
      });
    }
    
    // Clear inputs
    productSelect.value = '';
    quantityInput.value = '';
    document.getElementById('unit-display').textContent = 'units';
    
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    
    if (this.currentCart.length === 0) {
      cartList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Cart is empty</p>';
      cartTotal.style.display = 'none';
      checkoutBtn.style.display = 'none';
      clearCartBtn.style.display = 'none';
      document.querySelector('.cart-items h4').textContent = 'Current Cart (0 items)';
      return;
    }
    
    const subtotal = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    
    const cartItemsHtml = this.currentCart.map((item, index) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          <small>${item.quantity} ${item.unit} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}</small>
        </div>
        <button class="btn btn-danger" onclick="memberManager.removeFromCart(${index})" style="padding: 5px 10px;">Remove</button>
      </div>
    `).join('');
    
    cartList.innerHTML = cartItemsHtml;
    cartTotal.innerHTML = `
      <div>Subtotal: $${subtotal.toFixed(2)}</div>
      <div>Tax (${(this.taxRate * 100).toFixed(2)}%): $${tax.toFixed(2)}</div>
      <div style="font-size: 1.2em; margin-top: 10px;">Total: $${total.toFixed(2)}</div>
    `;
    
    cartTotal.style.display = 'block';
    checkoutBtn.style.display = 'inline-block';
    clearCartBtn.style.display = 'inline-block';
    document.querySelector('.cart-items h4').textContent = `Current Cart (${this.currentCart.length} items)`;
  }

  removeFromCart(index) {
    this.currentCart.splice(index, 1);
    this.updateCartDisplay();
  }

  clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.currentCart = [];
      this.updateCartDisplay();
    }
  }

  proceedToCheckout() {
    if (this.currentCart.length === 0) {
      alert('Cart is empty.');
      return;
    }
    
    const subtotal = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    
    const orderSummary = `
      <div style="margin-bottom: 20px;">
        <h4>Order Summary for ${this.currentMember.profile?.fullName || this.currentMember.username}</h4>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          ${this.currentCart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>${item.name} (${item.quantity} ${item.unit})</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <hr>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Tax (${(this.taxRate * 100).toFixed(2)}%):</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd; padding-top: 8px;">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Delivery Address</label>
          <textarea id="delivery-address" rows="3" placeholder="Enter delivery address...">${this.currentMember.profile?.address ? `${this.currentMember.profile.address}, ${this.currentMember.profile.city} ${this.currentMember.profile.zipcode}` : ''}</textarea>
        </div>
        
        <div class="form-group">
          <label>Order Notes (Optional)</label>
          <textarea id="order-notes" rows="2" placeholder="Special instructions or notes..."></textarea>
        </div>
      </div>
      
      <div style="text-align: center;">
        <button class="btn btn-success" onclick="memberManager.confirmOrder()" style="padding: 12px 30px; font-size: 1.1em;">
          ✅ Confirm Order
        </button>
        <button class="btn btn-secondary" onclick="closeModal('order-confirmation-modal')" style="padding: 12px 20px; margin-left: 10px;">
          Cancel
        </button>
      </div>
    `;
    
    document.getElementById('order-confirmation-content').innerHTML = orderSummary;
    showModal('order-confirmation-modal');
  }

  confirmOrder() {
    const deliveryAddress = document.getElementById('delivery-address').value.trim();
    const orderNotes = document.getElementById('order-notes').value.trim();
    
    if (!deliveryAddress) {
      alert('Please enter a delivery address.');
      return;
    }
    
    const subtotal = this.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    
    const newOrder = {
      id: Date.now(),
      userId: this.currentMember.id,
      customer: this.currentMember.profile?.fullName || this.currentMember.username,
      email: this.currentMember.profile?.email || '',
      date: new Date().toISOString(),
      status: 'pending',
      items: [...this.currentCart],
      subtotal: subtotal,
      tax: tax,
      total: total,
      address: deliveryAddress,
      notes: orderNotes,
      createdBy: localStorage.getItem('adminUser') || 'admin'
    };
    
    // Add to orders
    this.orders.unshift(newOrder);
    
    // Update member's total orders and spent
    if (this.currentMember.profile) {
      this.currentMember.profile.totalOrders = (this.currentMember.profile.totalOrders || 0) + 1;
      this.currentMember.profile.totalSpent = (this.currentMember.profile.totalSpent || 0) + total;
    }
    
    // Clear cart
    this.currentCart = [];
    
    // Update displays
    this.updateCartDisplay();
    this.displayMemberOrders(this.currentMember.id);
    
    // Close modal and show success
    closeModal('order-confirmation-modal');
    alert(`Order #${newOrder.id} has been successfully created for ${this.currentMember.profile?.fullName || this.currentMember.username}!\n\nTotal: $${total.toFixed(2)}`);
    
    // Switch to orders tab to show the new order
    this.showTab('orders');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab')[1].classList.add('active');
  }

  viewOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const orderDetailsHtml = `
      <h4>Order #${order.id}</h4>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        ${order.createdBy ? `<p><strong>Created by:</strong> ${order.createdBy}</p>` : ''}
        
        <h5 style="margin-top: 20px;">Items:</h5>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>${item.name} (${item.quantity} ${item.unit})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        
        <hr>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em;">
          <span>Total:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <button class="btn btn-secondary" onclick="closeModal('order-details-modal')">Close</button>
      </div>
    `;
    
    // Create modal if it doesn't exist
    if (!document.getElementById('order-details-modal')) {
      const modal = document.createElement('div');
      modal.id = 'order-details-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Order Details</h3>
            <button class="btn btn-secondary" onclick="closeModal('order-details-modal')" style="float: right;">Close</button>
          </div>
          <div id="order-details-content"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    document.getElementById('order-details-content').innerHTML = orderDetailsHtml;
    showModal('order-details-modal');
  }

  editMember(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return;
    
    const profile = member.profile || {};
    
    const editFormHtml = `
      <form id="edit-member-form">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="edit-fullname" value="${profile.fullName || ''}" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="edit-email" value="${profile.email || ''}" required>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="edit-phone" value="${profile.phone || ''}">
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="edit-address" value="${profile.address || ''}">
        </div>
        <div class="form-group">
          <label>Customer Group</label>
          <select id="edit-customer-group">
            <option value="standard" ${profile.customerGroup === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="premium" ${profile.customerGroup === 'premium' ? 'selected' : ''}>Premium</option>
            <option value="business" ${profile.customerGroup === 'business' ? 'selected' : ''}>Business</option>
            <option value="farmer" ${profile.customerGroup === 'farmer' ? 'selected' : ''}>Farmer Network</option>
            <option value="wholesale" ${profile.customerGroup === 'wholesale' ? 'selected' : ''}>Wholesale</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="edit-status">
            <option value="active" ${profile.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="suspended" ${profile.status === 'suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
        <div class="form-group">
          <label>Interests</label>
          <textarea id="edit-interests" rows="3">${profile.interests || ''}</textarea>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button type="submit" class="btn btn-success">Save Changes</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('edit-member-modal')">Cancel</button>
        </div>
      </form>
    `;
    
    document.getElementById('edit-member-content').innerHTML = editFormHtml;
    
    document.getElementById('edit-member-form').onsubmit = (e) => {
      e.preventDefault();
      this.saveMemberChanges(memberId);
    };
    
    showModal('edit-member-modal');
  }

  saveMemberChanges(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return;
    
    // Update member profile
    if (!member.profile) member.profile = {};
    
    member.profile.fullName = document.getElementById('edit-fullname').value;
    member.profile.email = document.getElementById('edit-email').value;
    member.profile.phone = document.getElementById('edit-phone').value;
    member.profile.address = document.getElementById('edit-address').value;
    member.profile.customerGroup = document.getElementById('edit-customer-group').value;
    member.profile.status = document.getElementById('edit-status').value;
    member.profile.interests = document.getElementById('edit-interests').value;
    
    // Update displays
    this.displayMembers();
    if (this.currentMember && this.currentMember.id === memberId) {
      this.currentMember = member;
      this.viewMemberProfile(memberId);
    }
    
    closeModal('edit-member-modal');
    alert('Member information updated successfully!');
  }

  refreshMembers() {
    this.loadMembers();
  }

  exportMembers() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Username,Full Name,Email,Phone,Customer Group,Status,Total Orders,Total Spent,Join Date\n" +
      this.members.map(member => {
        const profile = member.profile || {};
        return `"${member.username}","${profile.fullName || ''}","${profile.email || ''}","${profile.phone || ''}","${profile.customerGroup || ''}","${profile.status || 'active'}","${profile.totalOrders || 0}","${(profile.totalSpent || 0).toFixed(2)}","${profile.joinDate || ''}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize member manager
const memberManager = new MemberManager();

// Product selector change handler
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('change', function(e) {
    if (e.target.id === 'product-select') {
      const productId = parseInt(e.target.value);
      if (productId) {
        const product = memberManager.products.find(p => p.id === productId);
        if (product) {
          document.getElementById('unit-display').textContent = product.unit;
          document.getElementById('quantity-input').placeholder = `Quantity (${product.unit})`;
        }
      } else {
        document.getElementById('unit-display').textContent = 'units';
        document.getElementById('quantity-input').placeholder = 'Quantity';
      }
    }
  });
});

// Global functions for HTML
function searchMembers(query) {
  memberManager.searchMembers(query);
}

function filterByStatus(status) {
  memberManager.filterByStatus(status);
}

function refreshMembers() {
  memberManager.refreshMembers();
}

function exportMembers() {
  memberManager.exportMembers();
}
