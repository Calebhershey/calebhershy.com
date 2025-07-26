// Admin Database JavaScript
class AdminDatabase {
  constructor() {
    this.apiUrl = 'http://localhost:3000';
    this.products = JSON.parse(localStorage.getItem('admin_products')) || this.getDefaultProducts();
    this.invoices = JSON.parse(localStorage.getItem('admin_invoices')) || [];
    this.orders = [];
    this.customers = [];
    this.pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals')) || [];
    this.init();
  }

  init() {
    this.loadAllData();
    this.setupEventListeners();
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
        image: "images (4).jpeg",
        isWeightBased: false,
        defaultWeight: null
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
        image: "230511_LightorDarkBrownSugar_ddmfs_4x3_2404-8bd53810c76d4ac1b2db0cd83e7fb88a.jpg",
        isWeightBased: false,
        defaultWeight: null
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
        image: "images (3).jpeg",
        isWeightBased: true,
        defaultWeight: 1.0
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
        image: "images (1).jpeg",
        isWeightBased: false,
        defaultWeight: null
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
        image: "swiss-cheese-header_2.jpg",
        isWeightBased: false,
        defaultWeight: null
      }
    ];
  }

  async loadAllData() {
    try {
      await Promise.all([
        this.loadOrders(),
        this.loadCustomers(),
        this.loadPendingApprovals(),
        this.updateDashboard()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadOrders() {
    try {
      const response = await fetch(`${this.apiUrl}/orders`);
      if (response.ok) {
        this.orders = await response.json();
        console.log('Loaded orders from server');
        this.displayOrders();
        this.generateInvoicesFromOrders();
      } else {
        // Server responded but with error - use sample data
        console.log('Server error, using sample orders');
        this.orders = this.getSampleOrders();
        this.displayOrders();
      }
    } catch (error) {
      // Network error or server not available - use sample data silently
      console.log('Working offline - using sample orders');
      this.orders = this.getSampleOrders();
      this.displayOrders();
    }
  }

  async loadCustomers() {
    try {
      const response = await fetch(`${this.apiUrl}/debug/users`);
      if (response.ok) {
        this.customers = await response.json();
        console.log('Loaded customers from server');
        this.displayCustomers();
      } else {
        // Server responded but with error - use empty array (members-only mode)
        console.log('Server error, working in members-only mode');
        this.customers = [];
      }
    } catch (error) {
      // Network error or server not available - work silently offline
      console.log('Working offline - members-only mode');
      this.customers = [];
    }
  }

  async loadPendingApprovals() {
    try {
      const response = await fetch(`${this.apiUrl}/admin/pending-approvals`);
      if (response.ok) {
        this.pendingApprovals = await response.json();
        console.log('Loaded pending approvals from server');
      } else {
        // Server responded but with error - use fallback
        console.log('Server error, using sample data for pending approvals');
        this.pendingApprovals = this.getSamplePendingApprovals();
      }
      this.displayPendingApprovals();
    } catch (error) {
      // Network error or server not available - use sample data silently
      console.log('Working offline - using sample pending approvals');
      this.pendingApprovals = this.getSamplePendingApprovals();
      this.displayPendingApprovals();
    }
  }

  getSamplePendingApprovals() {
    return [
      {
        id: 'pending_001',
        username: 'mike_farmer',
        profile: {
          fullName: 'Mike Wilson',
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.wilson@email.com',
          phone: '(555) 234-5678',
          address: '789 Country Lane',
          city: 'Farmtown',
          zipcode: '12347',
          memberType: 'farmer',
          interests: 'Local farmer looking to sell produce and network with other farmers',
          newsletterConsent: true,
          agreementAccepted: true,
          agreementDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        status: 'pending',
        appliedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'pending_002',
        username: 'restaurant_owner',
        profile: {
          fullName: 'Lisa Chen',
          firstName: 'Lisa',
          lastName: 'Chen',
          email: 'lisa@freshbistro.com',
          phone: '(555) 345-6789',
          address: '456 Main Street',
          city: 'Downtown',
          zipcode: '12348',
          memberType: 'business',
          interests: 'Restaurant owner seeking fresh, local ingredients for farm-to-table menu',
          newsletterConsent: true,
          agreementAccepted: true,
          agreementDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        status: 'pending',
        appliedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'pending_003',
        username: 'family_smith',
        profile: {
          fullName: 'Jennifer Smith',
          firstName: 'Jennifer',
          lastName: 'Smith',
          email: 'jen.smith@email.com',
          phone: '(555) 456-7890',
          address: '123 Suburb Lane',
          city: 'Neighborhood',
          zipcode: '12349',
          memberType: 'family',
          interests: 'Family of 4 looking for organic, healthy food options for our kids',
          newsletterConsent: false,
          agreementAccepted: true,
          agreementDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          createdAt: new Date(Date.now() - 43200000).toISOString()
        },
        status: 'pending',
        appliedAt: new Date(Date.now() - 43200000).toISOString()
      }
    ];
  }

  getSampleOrders() {
    return [
      {
        id: 1001,
        customer: "John Smith",
        email: "john@example.com",
        date: new Date().toISOString(),
        status: "pending",
        items: [
          { productId: 1, name: "Farm Fresh Eggs", quantity: 2, price: 6.00, unit: "dozen" },
          { productId: 3, name: "Heirloom Tomatoes", quantity: 2.5, price: 8.50, unit: "lb" },
          { productId: 2, name: "Raw Local Honey", quantity: 1, price: 12.00, unit: "each" }
        ],
        total: 45.25,
        address: "123 Main St, Farmville, TX 12345"
      },
      {
        id: 1002,
        customer: "Sarah Johnson",
        email: "sarah@example.com",
        date: new Date(Date.now() - 86400000).toISOString(),
        status: "processing",
        items: [
          { productId: 3, name: "Heirloom Tomatoes", quantity: 1.8, price: 8.50, unit: "lb" },
          { productId: 4, name: "Fresh Milk", quantity: 1, price: 5.50, unit: "gallon" },
          { productId: 5, name: "Organic Cheese", quantity: 0.75, price: 15.00, unit: "lb" }
        ],
        total: 32.05,
        address: "456 Farm Rd, Countryside, TX 12346"
      },
      {
        id: 1003,
        customer: "Mike Wilson",
        email: "mike@example.com",
        date: new Date(Date.now() - 172800000).toISOString(),
        status: "completed",
        items: [
          { productId: 1, name: "Farm Fresh Eggs", quantity: 1, price: 6.00, unit: "dozen" },
          { productId: 4, name: "Fresh Milk", quantity: 2, price: 5.50, unit: "gallon" }
        ],
        total: 17.00,
        address: "789 Country Lane, Farmtown, TX 12347"
      }
    ];
  }

  updateDashboard() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProducts = this.products.length;
    const totalCustomers = this.customers.length;
    const pendingApprovals = this.pendingApprovals.length;

    document.getElementById('stat-orders').textContent = totalOrders;
    document.getElementById('stat-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('stat-products').textContent = totalProducts;
    document.getElementById('stat-customers').textContent = totalCustomers;

    // Add pending approvals notification to dashboard
    if (pendingApprovals > 0) {
      const pendingNotification = document.createElement('div');
      pendingNotification.style.cssText = `
        background: #fff3cd;
        border: 1px solid #ffc107;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;
        text-align: center;
      `;
      pendingNotification.innerHTML = `
        <strong>🔔 ${pendingApprovals} pending membership application${pendingApprovals > 1 ? 's' : ''}</strong><br>
        <button class="btn btn-warning" onclick="showSection('membership-approvals')" style="margin-top: 10px;">
          Review Applications
        </button>
      `;
      
      // Remove existing notification if present
      const existingNotification = document.querySelector('#dashboard .pending-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      
      // Add new notification
      pendingNotification.className = 'pending-notification';
      const dashboardSection = document.querySelector('#dashboard .section-content');
      dashboardSection.insertBefore(pendingNotification, dashboardSection.firstChild);
    }

    this.displayRecentActivity();
  }

  displayRecentActivity() {
    const recentOrders = this.orders.slice(-5).reverse();
    const activityHtml = recentOrders.map(order => `
      <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
        <strong>Order #${order.id}</strong> - ${order.customer || order.name}<br>
        <small>Total: $${(order.total || 0).toFixed(2)} | Status: ${order.status || 'pending'}</small>
      </div>
    `).join('');

    document.getElementById('recent-activity').innerHTML = activityHtml || '<p>No recent activity</p>';
  }

  displayOrders() {
    const ordersHtml = this.orders.map(order => `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer || order.name || 'N/A'}</td>
        <td>${new Date(order.date || order.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
        <td>$${(order.total || order.grandTotal || 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.editOrder(${order.id})">Edit</button>
          <button class="btn btn-warning" onclick="adminDB.updateOrderStatus(${order.id})">Update Status</button>
          <button class="btn btn-success" onclick="adminDB.createInvoiceFromOrder(${order.id})">Invoice</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('orders-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>
    `;
    
    // Also update amend orders display
    this.displayAmendOrders();
  }

  displayAmendOrders() {
    const ordersHtml = this.orders.filter(order => 
      order.status !== 'cancelled' && order.status !== 'completed'
    ).map(order => {
      const hasWeightItems = order.items && order.items.some(item => 
        ['lb', 'kg', 'pound', 'kilogram'].includes(item.unit?.toLowerCase())
      );
      const amendedCount = order.amendedItems ? order.amendedItems.length : 0;
      
      return `
        <tr>
          <td>#${order.id}</td>
          <td>${order.customer || order.name || 'N/A'}</td>
          <td>${new Date(order.date || order.createdAt).toLocaleDateString()}</td>
          <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
          <td>${order.items ? order.items.length : 0} items</td>
          <td>${hasWeightItems ? '✓ Has weight items' : 'No weight items'}</td>
          <td>${amendedCount > 0 ? `${amendedCount} amended` : 'Not amended'}</td>
          <td>
            <button class="btn btn-primary" onclick="adminDB.showAmendOrderModal(${order.id})">Amend Order</button>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('amend-orders-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Weight Items</th>
            <th>Amendment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>
    `;
  }

  displayProducts() {
    const productsHtml = this.products.map(product => `
      <tr>
        <td><img src="${product.image || 'placeholder.jpg'}" class="product-image" alt="${product.name}"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td><span class="status-badge status-${product.status === 'active' ? 'completed' : 'pending'}">${product.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.editProduct(${product.id})">Edit</button>
          <button class="btn btn-warning" onclick="adminDB.toggleProductStatus(${product.id})">Toggle Status</button>
          <button class="btn btn-danger" onclick="adminDB.deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('products-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>
    `;
  }

  displayCustomers() {
    const customersHtml = this.customers.map(customer => `
      <tr>
        <td>${customer.id}</td>
        <td>${customer.profile?.fullName || customer.username}</td>
        <td>${customer.profile?.email || 'N/A'}</td>
        <td>${customer.profile?.phone || 'N/A'}</td>
        <td>${customer.profile?.memberType || 'individual'}</td>
        <td>${new Date(customer.profile?.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.viewCustomer(${customer.id})">View</button>
          <button class="btn btn-warning" onclick="adminDB.emailCustomer('${customer.profile?.email}')">Email</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('customers-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Join Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${customersHtml}
        </tbody>
      </table>
    `;
  }

  generateInvoicesFromOrders() {
    this.invoices = this.orders.map(order => ({
      id: `INV-${order.id}`,
      orderId: order.id,
      customer: order.customer || order.name,
      email: order.email,
      date: order.date || order.createdAt,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: order.items || order.cart || [],
      subtotal: order.total || order.grandTotal || 0,
      tax: (order.total || order.grandTotal || 0) * 0.0825,
      total: (order.total || order.grandTotal || 0) * 1.0825,
      status: order.status === 'completed' ? 'paid' : 'pending',
      address: order.address
    }));

    localStorage.setItem('admin_invoices', JSON.stringify(this.invoices));
    this.displayInvoices();
  }

  displayInvoices() {
    const invoicesHtml = this.invoices.map(invoice => `
      <tr>
        <td>${invoice.id}</td>
        <td>${invoice.customer}</td>
        <td>${new Date(invoice.date).toLocaleDateString()}</td>
        <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
        <td>$${invoice.total.toFixed(2)}</td>
        <td><span class="status-badge status-${invoice.status === 'paid' ? 'completed' : 'pending'}">${invoice.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.viewInvoice('${invoice.id}')">View</button>
          <button class="btn btn-success" onclick="adminDB.printInvoice('${invoice.id}')">Print</button>
          <button class="btn btn-warning" onclick="adminDB.emailInvoice('${invoice.id}')">Email</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('invoices-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${invoicesHtml}
        </tbody>
      </table>
    `;
  }

  // Product Management
  addProduct(productData) {
    const newProduct = {
      id: Date.now(),
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock)
    };
    
    this.products.push(newProduct);
    localStorage.setItem('admin_products', JSON.stringify(this.products));
    this.displayProducts();
    this.updateDashboard();
    
    // Try to sync to server if available
    this.syncProductToServer(newProduct);
    
    console.log('Product added:', newProduct);
    alert(`Product "${newProduct.name}" has been added successfully!`);
  }

  async syncProductToServer(product) {
    try {
      await fetch(`${this.apiUrl}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      console.log('Product synced to server:', product.name);
    } catch (error) {
      console.log('Server sync failed (offline mode):', error.message);
    }
  }

  editProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-stock').value = product.stock;
      document.getElementById('product-description').value = product.description;
      document.getElementById('product-unit').value = product.unit;
      document.getElementById('product-status').value = product.status;
      if (document.getElementById('product-image')) {
        document.getElementById('product-image').value = product.image || '';
      }
      
      // Handle weight-based fields
      const isWeightBased = product.isWeightBased || false;
      document.getElementById('product-is-weight-based').checked = isWeightBased;
      document.getElementById('product-default-weight').value = product.defaultWeight || '';
      
      // Toggle weight fields display
      const weightGroup = document.getElementById('default-weight-group');
      weightGroup.style.display = isWeightBased ? 'block' : 'none';
      
      document.getElementById('product-modal-title').textContent = 'Edit Product';
      
      document.getElementById('product-form').onsubmit = (e) => {
        e.preventDefault();
        this.updateProduct(productId);
      };
      
      this.showModal('product-modal');
    }
  }

  updateProduct(productId) {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      const isWeightBased = document.getElementById('product-is-weight-based').checked;
      this.products[productIndex] = {
        ...this.products[productIndex],
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-description').value,
        unit: document.getElementById('product-unit').value,
        status: document.getElementById('product-status').value,
        image: document.getElementById('product-image') ? document.getElementById('product-image').value : (this.products[productIndex].image || 'placeholder.jpg'),
        isWeightBased: isWeightBased,
        defaultWeight: isWeightBased ? parseFloat(document.getElementById('product-default-weight').value) || 1.0 : null
      };
      
      localStorage.setItem('admin_products', JSON.stringify(this.products));
      this.displayProducts();
      this.closeModal('product-modal');
      
      console.log('Product updated:', this.products[productIndex]);
      alert(`Product "${this.products[productIndex].name}" has been updated successfully!`);
    }
  }

  deleteProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.products = this.products.filter(p => p.id !== productId);
      localStorage.setItem('admin_products', JSON.stringify(this.products));
      this.displayProducts();
      this.updateDashboard();
      
      console.log('Product deleted:', product.name);
      alert(`Product "${product.name}" has been deleted successfully!`);
    }
  }

  toggleProductStatus(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const oldStatus = product.status;
      product.status = product.status === 'active' ? 'inactive' : 'active';
      localStorage.setItem('admin_products', JSON.stringify(this.products));
      this.displayProducts();
      
      console.log(`Product "${product.name}" status changed from ${oldStatus} to ${product.status}`);
      alert(`Product "${product.name}" is now ${product.status.toUpperCase()}`);
    }
  }

  // Order Management
  editOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const orderFormHtml = `
        <form id="edit-order-form">
          <div class="form-grid">
            <div>
              <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="order-customer" value="${order.customer || order.name || ''}" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="order-email" value="${order.email || ''}" required>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select id="order-status" required>
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                  <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <div class="form-group">
                <label>Address</label>
                <textarea id="order-address" rows="3">${order.address || ''}</textarea>
              </div>
              <div class="form-group">
                <label>Total Amount</label>
                <input type="number" id="order-total" value="${order.total || order.grandTotal || 0}" step="0.01" required>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Update Order</button>
        </form>
      `;
      
      document.getElementById('order-modal-content').innerHTML = orderFormHtml;
      document.getElementById('order-modal-title').textContent = `Edit Order #${orderId}`;
      
      document.getElementById('edit-order-form').onsubmit = (e) => {
        e.preventDefault();
        this.updateOrder(orderId);
      };
      
      this.showModal('order-modal');
    }
  }

  updateOrder(orderId) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex] = {
        ...this.orders[orderIndex],
        customer: document.getElementById('order-customer').value,
        name: document.getElementById('order-customer').value,
        email: document.getElementById('order-email').value,
        status: document.getElementById('order-status').value,
        address: document.getElementById('order-address').value,
        total: parseFloat(document.getElementById('order-total').value),
        grandTotal: parseFloat(document.getElementById('order-total').value)
      };
      
      this.displayOrders();
      this.updateDashboard();
      this.closeModal('order-modal');
      
      // Update on server if available
      this.updateOrderOnServer(orderId, this.orders[orderIndex]);
    }
  }

  async updateOrderOnServer(orderId, orderData) {
    try {
      await fetch(`${this.apiUrl}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderData.status })
      });
    } catch (error) {
      console.error('Error updating order on server:', error);
    }
  }

  updateOrderStatus(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const newStatus = prompt('Enter new status (pending, processing, completed, cancelled):', order.status);
      if (newStatus && ['pending', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
        order.status = newStatus;
        this.displayOrders();
        this.updateDashboard();
        this.updateOrderOnServer(orderId, order);
      }
    }
  }

  createInvoiceFromOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const invoice = {
        id: `INV-${orderId}`,
        orderId: orderId,
        customer: order.customer || order.name,
        email: order.email,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: order.items || order.cart || [],
        subtotal: order.total || order.grandTotal || 0,
        tax: (order.total || order.grandTotal || 0) * 0.0825,
        total: (order.total || order.grandTotal || 0) * 1.0825,
        status: 'pending',
        address: order.address
      };
      
      const existingInvoiceIndex = this.invoices.findIndex(inv => inv.orderId === orderId);
      if (existingInvoiceIndex !== -1) {
        this.invoices[existingInvoiceIndex] = invoice;
      } else {
        this.invoices.push(invoice);
      }
      
      localStorage.setItem('admin_invoices', JSON.stringify(this.invoices));
      this.displayInvoices();
      this.viewInvoice(invoice.id);
    }
  }

  // Invoice Management
  viewInvoice(invoiceId) {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const invoiceHtml = `
        <div class="invoice-header">
          <div>
            <h2>Grazin Acres</h2>
            <p>Fresh Farm Products<br>
            123 Farm Road<br>
            Farmville, TX 12345<br>
            Phone: (555) 123-4567</p>
          </div>
          <div style="text-align: right;">
            <h3>INVOICE</h3>
            <p><strong>Invoice #:</strong> ${invoice.id}<br>
            <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}<br>
            <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4>Bill To:</h4>
          <p><strong>${invoice.customer}</strong><br>
          ${invoice.email}<br>
          ${invoice.address || ''}</p>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price || 0).toFixed(2)}</td>
                <td>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
          <p><strong>Tax (8.25%): $${invoice.tax.toFixed(2)}</strong></p>
          <p style="font-size: 1.2em;"><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
        </div>
        
        <div style="margin-top: 30px;">
          <button class="btn btn-primary" onclick="adminDB.markInvoicePaid('${invoice.id}')">Mark as Paid</button>
          <button class="btn btn-secondary" onclick="adminDB.printInvoice('${invoice.id}')">Print</button>
          <button class="btn btn-warning" onclick="adminDB.emailInvoice('${invoice.id}')">Send Email</button>
        </div>
      `;
      
      document.getElementById('invoice-content').innerHTML = invoiceHtml;
      this.showModal('invoice-modal');
    }
  }

  markInvoicePaid(invoiceId) {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.status = 'paid';
      localStorage.setItem('admin_invoices', JSON.stringify(this.invoices));
      this.displayInvoices();
      this.closeModal('invoice-modal');
    }
  }

  printInvoice(invoiceId) {
    this.viewInvoice(invoiceId);
    setTimeout(() => {
      window.print();
    }, 500);
  }

  emailInvoice(invoiceId) {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (invoice && invoice.email) {
      const subject = `Invoice ${invoice.id} from Grazin Acres`;
      const body = `Dear ${invoice.customer},\n\nPlease find attached your invoice ${invoice.id} for $${invoice.total.toFixed(2)}.\n\nThank you for your business!\n\nGrazin Acres`;
      window.open(`mailto:${invoice.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }

  // Order Amendment Functions
  showAmendOrderModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    // Initialize amendedItems if not exists
    if (!order.amendedItems) {
      order.amendedItems = [];
    }

    const orderItems = order.items || order.cart || [];
    
    const amendFormHtml = `
      <form id="amend-order-form">
        <div class="invoice-header">
          <div>
            <h4>Order #${order.id}</h4>
            <p><strong>Customer:</strong> ${order.customer || order.name}<br>
            <strong>Email:</strong> ${order.email || 'N/A'}<br>
            <strong>Status:</strong> ${order.status || 'pending'}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Date:</strong> ${new Date(order.date || order.createdAt).toLocaleDateString()}<br>
            <strong>Original Total:</strong> $${(order.total || order.grandTotal || 0).toFixed(2)}</p>
          </div>
        </div>

        <h4>Order Items Amendment</h4>
        <div id="amend-items-list">
          ${orderItems.map((item, index) => this.renderAmendItem(item, index, order)).join('')}
        </div>

        <div class="amend-summary">
          <h4>Amendment Summary</h4>
          <div id="amendment-summary">
            <p>Amended items will be calculated with actual weights and stock availability.</p>
          </div>
          <button type="button" class="btn btn-success" onclick="adminDB.calculateAmendedTotal(${orderId})">Calculate New Total</button>
          <button type="submit" class="btn btn-primary">Save Amendments</button>
        </div>
      </form>
    `;
    
    document.getElementById('amend-order-content').innerHTML = amendFormHtml;
    document.getElementById('amend-order-modal-title').textContent = `Amend Order #${orderId}`;
    
    document.getElementById('amend-order-form').onsubmit = (e) => {
      e.preventDefault();
      this.saveOrderAmendments(orderId);
    };
    
    this.showModal('amend-order-modal');
  }

  renderAmendItem(item, index, order) {
    const product = this.products.find(p => p.name === item.name || p.id === item.productId);
    const isWeightItem = ['lb', 'kg', 'pound', 'kilogram'].includes(item.unit?.toLowerCase());
    const amendedItem = order.amendedItems?.find(a => a.index === index);
    const isOutOfStock = amendedItem?.outOfStock || false;
    const actualWeight = amendedItem?.actualWeight || item.weight || '';
    
    const itemClass = isOutOfStock ? 'amend-item out-of-stock' : (amendedItem ? 'amend-item weight-amended' : 'amend-item');
    
    return `
      <div class="${itemClass}">
        <div class="item-row">
          <div class="item-details">
            <strong>${item.name}</strong><br>
            <small>Original: ${item.quantity || 1} ${item.unit || 'each'} × $${(item.price || 0).toFixed(2)} = $${((item.quantity || 1) * (item.price || 0)).toFixed(2)}</small>
            ${product ? `<br><small>Available Stock: ${product.stock} ${product.unit}</small>` : ''}
          </div>
          <div class="item-controls">
            ${isWeightItem ? `
              <label>Actual Weight:</label>
              <input type="number" class="weight-input" 
                     id="weight-${index}" 
                     value="${actualWeight}" 
                     step="0.01" 
                     placeholder="0.00"
                     ${isOutOfStock ? 'disabled' : ''}>
              <span>${item.unit}</span>
            ` : ''}
            
            <label class="stock-toggle">
              <input type="checkbox" 
                     id="stock-${index}" 
                     ${isOutOfStock ? 'checked' : ''}
                     onchange="adminDB.toggleItemStock(${index}, ${order.id})">
              Out of Stock
            </label>
          </div>
        </div>
      </div>
    `;
  }

  toggleItemStock(itemIndex, orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    if (!order.amendedItems) {
      order.amendedItems = [];
    }

    const checkbox = document.getElementById(`stock-${itemIndex}`);
    const weightInput = document.getElementById(`weight-${itemIndex}`);
    const isOutOfStock = checkbox.checked;

    // Find or create amended item
    let amendedItem = order.amendedItems.find(a => a.index === itemIndex);
    if (!amendedItem) {
      amendedItem = { index: itemIndex };
      order.amendedItems.push(amendedItem);
    }

    amendedItem.outOfStock = isOutOfStock;

    // Disable/enable weight input
    if (weightInput) {
      weightInput.disabled = isOutOfStock;
      if (isOutOfStock) {
        weightInput.value = '';
        amendedItem.actualWeight = null;
      }
    }

    // Update visual state
    const itemDiv = checkbox.closest('.amend-item');
    if (isOutOfStock) {
      itemDiv.classList.add('out-of-stock');
      itemDiv.classList.remove('weight-amended');
    } else {
      itemDiv.classList.remove('out-of-stock');
    }
  }

  calculateAmendedTotal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const orderItems = order.items || order.cart || [];
    let newTotal = 0;
    let amendmentSummary = [];

    orderItems.forEach((item, index) => {
      const amendedItem = order.amendedItems?.find(a => a.index === index);
      
      if (amendedItem?.outOfStock) {
        amendmentSummary.push(`❌ ${item.name}: Out of stock (removed from order)`);
        return;
      }

      const weightInput = document.getElementById(`weight-${index}`);
      const isWeightItem = ['lb', 'kg', 'pound', 'kilogram'].includes(item.unit?.toLowerCase());
      
      if (isWeightItem && weightInput) {
        const actualWeight = parseFloat(weightInput.value) || 0;
        if (actualWeight > 0) {
          const itemTotal = actualWeight * (item.price || 0);
          newTotal += itemTotal;
          amendmentSummary.push(`✓ ${item.name}: ${actualWeight} ${item.unit} × $${(item.price || 0).toFixed(2)} = $${itemTotal.toFixed(2)}`);
          
          // Update amended item
          if (!order.amendedItems) order.amendedItems = [];
          let amendedItem = order.amendedItems.find(a => a.index === index);
          if (!amendedItem) {
            amendedItem = { index: index };
            order.amendedItems.push(amendedItem);
          }
          amendedItem.actualWeight = actualWeight;
        } else {
          const originalTotal = (item.quantity || 1) * (item.price || 0);
          newTotal += originalTotal;
          amendmentSummary.push(`⚠️ ${item.name}: No weight entered, using original quantity`);
        }
      } else {
        // Non-weight items keep original pricing
        const itemTotal = (item.quantity || 1) * (item.price || 0);
        newTotal += itemTotal;
        amendmentSummary.push(`➤ ${item.name}: $${itemTotal.toFixed(2)} (unchanged)`);
      }
    });

    const tax = newTotal * 0.0825;
    const finalTotal = newTotal + tax;

    document.getElementById('amendment-summary').innerHTML = `
      <div style="margin-bottom: 15px;">
        ${amendmentSummary.map(item => `<div>${item}</div>`).join('')}
      </div>
      <hr>
      <div><strong>Subtotal: $${newTotal.toFixed(2)}</strong></div>
      <div>Tax (8.25%): $${tax.toFixed(2)}</div>
      <div style="font-size: 1.1em;"><strong>New Total: $${finalTotal.toFixed(2)}</strong></div>
      <div style="color: #666; margin-top: 10px;">
        Original Total: $${(order.total || order.grandTotal || 0).toFixed(2)} | 
        Difference: ${finalTotal > (order.total || order.grandTotal || 0) ? '+' : ''}$${(finalTotal - (order.total || order.grandTotal || 0)).toFixed(2)}
      </div>
    `;
  }

  saveOrderAmendments(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    // Calculate final amended total
    this.calculateAmendedTotal(orderId);
    
    // Update order with amendments
    order.amended = true;
    order.amendedDate = new Date().toISOString();
    
    // Save amendments
    const orderItems = order.items || order.cart || [];
    orderItems.forEach((item, index) => {
      const weightInput = document.getElementById(`weight-${index}`);
      const stockCheckbox = document.getElementById(`stock-${index}`);
      
      if (weightInput || stockCheckbox) {
        if (!order.amendedItems) order.amendedItems = [];
        let amendedItem = order.amendedItems.find(a => a.index === index);
        if (!amendedItem) {
          amendedItem = { index: index };
          order.amendedItems.push(amendedItem);
        }
        
        if (weightInput && weightInput.value) {
          amendedItem.actualWeight = parseFloat(weightInput.value);
        }
        if (stockCheckbox) {
          amendedItem.outOfStock = stockCheckbox.checked;
        }
      }
    });

    // Recalculate order total based on amendments
    let newSubtotal = 0;
    orderItems.forEach((item, index) => {
      const amendedItem = order.amendedItems?.find(a => a.index === index);
      
      if (amendedItem?.outOfStock) return;
      
      const isWeightItem = ['lb', 'kg', 'pound', 'kilogram'].includes(item.unit?.toLowerCase());
      if (isWeightItem && amendedItem?.actualWeight) {
        newSubtotal += amendedItem.actualWeight * (item.price || 0);
      } else {
        newSubtotal += (item.quantity || 1) * (item.price || 0);
      }
    });

    const tax = newSubtotal * 0.0825;
    order.amendedTotal = newSubtotal + tax;
    order.total = order.amendedTotal;
    order.grandTotal = order.amendedTotal;

    // Update displays
    this.displayOrders();
    this.updateDashboard();
    this.closeModal('amend-order-modal');
    
    alert(`Order #${orderId} has been successfully amended. New total: $${order.amendedTotal.toFixed(2)}`);
  }

  // Membership Approval Functions
  approveMembership(applicationId) {
    const application = this.pendingApprovals.find(app => app.id === applicationId);
    if (!application) return;

    const customerGroup = document.getElementById(`group-${applicationId}`).value;
    if (!customerGroup) {
      alert('Please select a customer group before approving the membership.');
      return;
    }

    // Create approved user record
    const approvedUser = {
      id: Date.now(),
      username: application.username,
      profile: {
        ...application.profile,
        customerGroup: customerGroup,
        approvedAt: new Date().toISOString(),
        approvedBy: localStorage.getItem('adminUser') || 'admin',
        status: 'approved'
      }
    };

    // Add to customers list
    this.customers.push(approvedUser);

    // Remove from pending approvals
    this.pendingApprovals = this.pendingApprovals.filter(app => app.id !== applicationId);

    // Save to localStorage
    localStorage.setItem('pending_approvals', JSON.stringify(this.pendingApprovals));

    // Update server if available
    this.updateMembershipStatusOnServer(applicationId, 'approved', customerGroup);

    // Update displays
    this.displayPendingApprovals();
    this.displayCustomers();
    this.updateDashboard();

    alert(`Membership approved! ${application.profile.fullName} has been added to the ${customerGroup} group.`);
  }

  rejectMembership(applicationId) {
    const application = this.pendingApprovals.find(app => app.id === applicationId);
    if (!application) return;

    const reason = prompt('Please provide a reason for rejection (optional):');
    
    if (confirm(`Are you sure you want to reject ${application.profile.fullName}'s membership application?`)) {
      // Update application status
      application.status = 'rejected';
      application.rejectedAt = new Date().toISOString();
      application.rejectedBy = localStorage.getItem('adminUser') || 'admin';
      application.rejectionReason = reason || 'No reason provided';

      // Remove from pending approvals
      this.pendingApprovals = this.pendingApprovals.filter(app => app.id !== applicationId);

      // Save to localStorage
      localStorage.setItem('pending_approvals', JSON.stringify(this.pendingApprovals));

      // Update server if available
      this.updateMembershipStatusOnServer(applicationId, 'rejected', null, reason);

      // Update display
      this.displayPendingApprovals();

      alert(`Membership application rejected. ${application.profile.fullName} has been notified.`);
    }
  }

  reviewMembershipDetails(applicationId) {
    const application = this.pendingApprovals.find(app => app.id === applicationId);
    if (!application) return;

    const memberTypeLabels = {
      'individual': 'Individual Consumer',
      'family': 'Family Plan',
      'business': 'Business/Restaurant',
      'farmer': 'Local Farmer/Producer'
    };

    const reviewHtml = `
      <div class="member-info-grid">
        <div class="member-info-section">
          <h4>Personal Information</h4>
          <p><strong>Full Name:</strong> ${application.profile.fullName}</p>
          <p><strong>Username:</strong> ${application.username}</p>
          <p><strong>Email:</strong> ${application.profile.email}</p>
          <p><strong>Phone:</strong> ${application.profile.phone}</p>
          <p><strong>Birthdate:</strong> ${application.profile.birthdate ? new Date(application.profile.birthdate).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div class="member-info-section">
          <h4>Address Information</h4>
          <p><strong>Street:</strong> ${application.profile.address}</p>
          <p><strong>City:</strong> ${application.profile.city}</p>
          <p><strong>ZIP Code:</strong> ${application.profile.zipcode}</p>
        </div>
      </div>
      
      <div class="member-info-section">
        <h4>Membership Details</h4>
        <p><strong>Requested Type:</strong> ${memberTypeLabels[application.profile.memberType] || application.profile.memberType}</p>
        <p><strong>Newsletter Consent:</strong> ${application.profile.newsletterConsent ? 'Yes' : 'No'}</p>
        <p><strong>Application Date:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
        <p><strong>Agreement Signed:</strong> ${new Date(application.profile.agreementDate).toLocaleDateString()}</p>
      </div>

      <div class="member-info-section">
        <h4>Interests & Background</h4>
        <p><em>${application.profile.interests || 'No specific interests provided'}</em></p>
      </div>

      ${application.profile.signature ? `
        <div class="member-info-section">
          <h4>Digital Signature</h4>
          <img src="${application.profile.signature}" alt="Digital Signature" class="signature-preview">
        </div>
      ` : ''}

      <div class="approval-actions" style="margin-top: 20px;">
        <select class="customer-group-select" id="modal-group-${applicationId}">
          <option value="">Select Customer Group</option>
          <option value="premium">Premium Members</option>
          <option value="standard">Standard Members</option>
          <option value="business">Business Customers</option>
          <option value="farmer">Farmer Network</option>
          <option value="wholesale">Wholesale Buyers</option>
        </select>
        <button class="btn btn-success" onclick="adminDB.approveFromModal('${applicationId}')">✅ Approve Membership</button>
        <button class="btn btn-danger" onclick="adminDB.rejectFromModal('${applicationId}')">❌ Reject Application</button>
      </div>
    `;

    document.getElementById('membership-review-content').innerHTML = reviewHtml;
    document.getElementById('membership-review-modal-title').textContent = `Review: ${application.profile.fullName}`;
    this.showModal('membership-review-modal');
  }

  approveFromModal(applicationId) {
    const customerGroup = document.getElementById(`modal-group-${applicationId}`).value;
    if (!customerGroup) {
      alert('Please select a customer group before approving the membership.');
      return;
    }
    
    this.closeModal('membership-review-modal');
    
    // Set the group in the main form
    document.getElementById(`group-${applicationId}`).value = customerGroup;
    
    // Approve the membership
    this.approveMembership(applicationId);
  }

  rejectFromModal(applicationId) {
    this.closeModal('membership-review-modal');
    this.rejectMembership(applicationId);
  }

  async updateMembershipStatusOnServer(applicationId, status, customerGroup = null, reason = null) {
    try {
      await fetch(`${this.apiUrl}/admin/membership-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId, 
          status, 
          customerGroup, 
          reason,
          adminUser: localStorage.getItem('adminUser') || 'admin'
        })
      });
    } catch (error) {
      console.error('Error updating membership status on server:', error);
    }
  }

  // Search Functions
  searchOrders(query) {
    const filteredOrders = this.orders.filter(order => 
      (order.customer || order.name || '').toLowerCase().includes(query.toLowerCase()) ||
      order.id.toString().includes(query) ||
      (order.email || '').toLowerCase().includes(query.toLowerCase())
    );
    
    const ordersHtml = filteredOrders.map(order => `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer || order.name || 'N/A'}</td>
        <td>${new Date(order.date || order.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
        <td>$${(order.total || order.grandTotal || 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.editOrder(${order.id})">Edit</button>
          <button class="btn btn-warning" onclick="adminDB.updateOrderStatus(${order.id})">Update Status</button>
          <button class="btn btn-success" onclick="adminDB.createInvoiceFromOrder(${order.id})">Invoice</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('orders-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>
    `;
  }

  searchProducts(query) {
    const filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    const productsHtml = filteredProducts.map(product => `
      <tr>
        <td><img src="${product.image || 'placeholder.jpg'}" class="product-image" alt="${product.name}"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td><span class="status-badge status-${product.status === 'active' ? 'completed' : 'pending'}">${product.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.editProduct(${product.id})">Edit</button>
          <button class="btn btn-warning" onclick="adminDB.toggleProductStatus(${product.id})">Toggle Status</button>
          <button class="btn btn-danger" onclick="adminDB.deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('products-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>
    `;
  }

  searchInvoices(query) {
    const filteredInvoices = this.invoices.filter(invoice => 
      invoice.customer.toLowerCase().includes(query.toLowerCase()) ||
      invoice.id.toLowerCase().includes(query.toLowerCase()) ||
      invoice.email.toLowerCase().includes(query.toLowerCase())
    );
    
    const invoicesHtml = filteredInvoices.map(invoice => `
      <tr>
        <td>${invoice.id}</td>
        <td>${invoice.customer}</td>
        <td>${new Date(invoice.date).toLocaleDateString()}</td>
        <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
        <td>$${invoice.total.toFixed(2)}</td>
        <td><span class="status-badge status-${invoice.status === 'paid' ? 'completed' : 'pending'}">${invoice.status.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.viewInvoice('${invoice.id}')">View</button>
          <button class="btn btn-success" onclick="adminDB.printInvoice('${invoice.id}')">Print</button>
          <button class="btn btn-warning" onclick="adminDB.emailInvoice('${invoice.id}')">Email</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('invoices-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${invoicesHtml}
        </tbody>
      </table>
    `;
  }

  searchCustomers(query) {
    const filteredCustomers = this.customers.filter(customer => 
      (customer.profile?.fullName || customer.username).toLowerCase().includes(query.toLowerCase()) ||
      (customer.profile?.email || '').toLowerCase().includes(query.toLowerCase())
    );
    
    const customersHtml = filteredCustomers.map(customer => `
      <tr>
        <td>${customer.id}</td>
        <td>${customer.profile?.fullName || customer.username}</td>
        <td>${customer.profile?.email || 'N/A'}</td>
        <td>${customer.profile?.phone || 'N/A'}</td>
        <td>${customer.profile?.memberType || 'individual'}</td>
        <td>${new Date(customer.profile?.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-primary" onclick="adminDB.viewCustomer(${customer.id})">View</button>
          <button class="btn btn-warning" onclick="adminDB.emailCustomer('${customer.profile?.email}')">Email</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('customers-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Join Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${customersHtml}
        </tbody>
      </table>
    `;
  }

  searchAmendOrders(query) {
    const filteredOrders = this.orders.filter(order => 
      order.status !== 'cancelled' && order.status !== 'completed' &&
      ((order.customer || order.name || '').toLowerCase().includes(query.toLowerCase()) ||
       order.id.toString().includes(query) ||
       (order.email || '').toLowerCase().includes(query.toLowerCase()))
    );
    
    const ordersHtml = filteredOrders.map(order => {
      const hasWeightItems = order.items && order.items.some(item => 
        ['lb', 'kg', 'pound', 'kilogram'].includes(item.unit?.toLowerCase())
      );
      const amendedCount = order.amendedItems ? order.amendedItems.length : 0;
      
      return `
        <tr>
          <td>#${order.id}</td>
          <td>${order.customer || order.name || 'N/A'}</td>
          <td>${new Date(order.date || order.createdAt).toLocaleDateString()}</td>
          <td><span class="status-badge status-${order.status || 'pending'}">${(order.status || 'pending').toUpperCase()}</span></td>
          <td>${order.items ? order.items.length : 0} items</td>
          <td>${hasWeightItems ? '✓ Has weight items' : 'No weight items'}</td>
          <td>${amendedCount > 0 ? `${amendedCount} amended` : 'Not amended'}</td>
          <td>
            <button class="btn btn-primary" onclick="adminDB.showAmendOrderModal(${order.id})">Amend Order</button>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('amend-orders-list').innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Weight Items</th>
            <th>Amendment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHtml}
        </tbody>
      </table>
    `;
  }

  displayPendingApprovals() {
    const approvalCards = this.pendingApprovals.map(application => {
      const memberTypeLabels = {
        'individual': 'Individual Consumer',
        'family': 'Family Plan',
        'business': 'Business/Restaurant',
        'farmer': 'Local Farmer/Producer'
      };
      
      return `
        <div class="membership-card pending">
          <div class="member-info-grid">
            <div class="member-info-section">
              <h4>Applicant Information</h4>
              <p><strong>Name:</strong> ${application.profile.fullName}</p>
              <p><strong>Username:</strong> ${application.username}</p>
              <p><strong>Email:</strong> ${application.profile.email}</p>
              <p><strong>Phone:</strong> ${application.profile.phone}</p>
              <p><strong>Address:</strong> ${application.profile.address}, ${application.profile.city} ${application.profile.zipcode}</p>
              <p><strong>Applied:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>
            <div class="member-info-section">
              <h4>Membership Details</h4>
              <p><strong>Type:</strong> ${memberTypeLabels[application.profile.memberType] || application.profile.memberType}</p>
              <p><strong>Newsletter:</strong> ${application.profile.newsletterConsent ? 'Yes' : 'No'}</p>
              <p><strong>Agreement:</strong> Signed ${new Date(application.profile.agreementDate).toLocaleDateString()}</p>
              <div style="margin-top: 10px;">
                <strong>Interests:</strong><br>
                <em>${application.profile.interests || 'No specific interests provided'}</em>
              </div>
            </div>
          </div>
          <div class="approval-actions">
            <select class="customer-group-select" id="group-${application.id}">
              <option value="">Select Customer Group</option>
              <option value="premium">Premium Members</option>
              <option value="standard">Standard Members</option>
              <option value="business">Business Customers</option>
              <option value="farmer">Farmer Network</option>
              <option value="wholesale">Wholesale Buyers</option>
            </select>
            <button class="btn btn-success" onclick="adminDB.approveMembership('${application.id}')">✅ Approve</button>
            <button class="btn btn-danger" onclick="adminDB.rejectMembership('${application.id}')">❌ Reject</button>
            <button class="btn btn-primary" onclick="adminDB.reviewMembershipDetails('${application.id}')">👁️ Review Details</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('pending-approvals-list').innerHTML = 
      approvalCards.length > 0 ? approvalCards : '<p>No pending membership applications.</p>';
  }

  searchPendingApprovals(query) {
    const filteredApprovals = this.pendingApprovals.filter(application => 
      application.profile.fullName.toLowerCase().includes(query.toLowerCase()) ||
      application.username.toLowerCase().includes(query.toLowerCase()) ||
      application.profile.email.toLowerCase().includes(query.toLowerCase()) ||
      application.profile.memberType.toLowerCase().includes(query.toLowerCase())
    );
    
    const originalApprovals = this.pendingApprovals;
    this.pendingApprovals = filteredApprovals;
    this.displayPendingApprovals();
    this.pendingApprovals = originalApprovals;
  }

  // Modal Functions
  showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
  }

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'product-modal') {
      document.getElementById('product-form').reset();
      document.getElementById('product-form').onsubmit = (e) => {
        e.preventDefault();
        this.handleAddProduct();
      };
    }
  }

  setupEventListeners() {
    // Product form submission
    document.getElementById('product-form').onsubmit = (e) => {
      e.preventDefault();
      this.handleAddProduct();
    };

    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  }

  handleAddProduct() {
    const isWeightBased = document.getElementById('product-is-weight-based').checked;
    const productData = {
      name: document.getElementById('product-name').value,
      category: document.getElementById('product-category').value,
      price: document.getElementById('product-price').value,
      stock: document.getElementById('product-stock').value,
      description: document.getElementById('product-description').value,
      unit: document.getElementById('product-unit').value,
      status: document.getElementById('product-status').value,
      image: document.getElementById('product-image') ? document.getElementById('product-image').value : 'placeholder.jpg',
      isWeightBased: isWeightBased,
      defaultWeight: isWeightBased ? parseFloat(document.getElementById('product-default-weight').value) || 1.0 : null
    };
    
    this.addProduct(productData);
    this.closeModal('product-modal');
  }

  // Export Functions
  exportOrders() {
    const csv = this.convertToCSV(this.orders, ['id', 'customer', 'email', 'date', 'status', 'total']);
    this.downloadCSV(csv, 'orders.csv');
  }

  exportProducts() {
    const csv = this.convertToCSV(this.products, ['id', 'name', 'category', 'price', 'stock', 'status']);
    this.downloadCSV(csv, 'products.csv');
  }

  exportInvoices() {
    const csv = this.convertToCSV(this.invoices, ['id', 'customer', 'date', 'total', 'status']);
    this.downloadCSV(csv, 'invoices.csv');
  }

  exportCustomers() {
    const customerData = this.customers.map(c => ({
      id: c.id,
      name: c.profile?.fullName || c.username,
      email: c.profile?.email,
      phone: c.profile?.phone,
      memberType: c.profile?.memberType,
      joinDate: c.profile?.createdAt
    }));
    const csv = this.convertToCSV(customerData, ['id', 'name', 'email', 'phone', 'memberType', 'joinDate']);
    this.downloadCSV(csv, 'customers.csv');
  }

  convertToCSV(data, headers) {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = header.includes('.') ? 
          header.split('.').reduce((obj, prop) => obj?.[prop], row) : 
          row[header];
        return `"${(value || '').toString().replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    return csvContent;
  }

  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Report Functions
  generateSalesReport() {
    const totalSales = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const avgOrderValue = this.orders.length > 0 ? totalSales / this.orders.length : 0;
    
    const reportHtml = `
      <h4>Sales Report</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">$${totalSales.toFixed(2)}</div>
          <div class="stat-label">Total Sales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${completedOrders}</div>
          <div class="stat-label">Completed Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">$${avgOrderValue.toFixed(2)}</div>
          <div class="stat-label">Average Order Value</div>
        </div>
      </div>
    `;
    
    document.getElementById('reports-content').innerHTML = reportHtml;
  }

  generateProductReport() {
    const topProducts = this.products
      .filter(p => p.status === 'active')
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
    
    const reportHtml = `
      <h4>Product Performance</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${topProducts.map(product => `
            <tr>
              <td>${product.name}</td>
              <td>${product.category}</td>
              <td>$${product.price.toFixed(2)}</td>
              <td>${product.stock}</td>
              <td><span class="status-badge status-completed">${product.status.toUpperCase()}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('reports-content').innerHTML = reportHtml;
  }

  generateCustomerReport() {
    const totalCustomers = this.customers.length;
    const memberTypes = this.customers.reduce((acc, customer) => {
      const type = customer.profile?.memberType || 'individual';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const reportHtml = `
      <h4>Customer Analytics</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalCustomers}</div>
          <div class="stat-label">Total Customers</div>
        </div>
        ${Object.entries(memberTypes).map(([type, count]) => `
          <div class="stat-card">
            <div class="stat-number">${count}</div>
            <div class="stat-label">${type.charAt(0).toUpperCase() + type.slice(1)} Members</div>
          </div>
        `).join('')}
      </div>
    `;
    
    document.getElementById('reports-content').innerHTML = reportHtml;
  }

  generateOrderReport() {
    const ordersByStatus = this.orders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const reportHtml = `
      <h4>Order Trends</h4>
      <div class="stats-grid">
        ${Object.entries(ordersByStatus).map(([status, count]) => `
          <div class="stat-card">
            <div class="stat-number">${count}</div>
            <div class="stat-label">${status.charAt(0).toUpperCase() + status.slice(1)} Orders</div>
          </div>
        `).join('')}
      </div>
    `;
    
    document.getElementById('reports-content').innerHTML = reportHtml;
  }

  // Settings
  saveSettings() {
    const settings = {
      farmName: document.getElementById('farm-name').value,
      farmEmail: document.getElementById('farm-email').value,
      farmPhone: document.getElementById('farm-phone').value,
      taxRate: document.getElementById('tax-rate').value,
      currency: document.getElementById('currency').value,
      paymentTerms: document.getElementById('payment-terms').value
    };
    
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  }

  // Customer Management
  viewCustomer(customerId) {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      alert(`Customer Details:\n\nName: ${customer.profile?.fullName || customer.username}\nEmail: ${customer.profile?.email}\nPhone: ${customer.profile?.phone}\nMember Type: ${customer.profile?.memberType}`);
    }
  }

  emailCustomer(email) {
    if (email) {
      window.open(`mailto:${email}`);
    }
  }
}

// Global functions for HTML onclick events
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Update sidebar active state
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    orders: 'Order Management',
    'amend-orders': 'Amend Orders',
    invoices: 'Invoice Management',
    products: 'Product Manager',
    customers: 'Customer Management',
    'membership-approvals': 'Membership Approvals',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };
  
  const descriptions = {
    dashboard: 'Overview of your farm business',
    orders: 'Manage and track customer orders',
    'amend-orders': 'Add weights and manage stock for orders',
    invoices: 'Create and manage invoices',
    products: 'Manage your farm products',
    customers: 'View and manage customer accounts',
    'membership-approvals': 'Review and approve new membership applications',
    reports: 'Business analytics and reports',
    settings: 'Configure system settings'
  };
  
  document.getElementById('page-title').textContent = titles[sectionId];
  document.getElementById('page-description').textContent = descriptions[sectionId];
  
  // Load section-specific data
  if (sectionId === 'products') {
    adminDB.displayProducts();
  } else if (sectionId === 'invoices') {
    adminDB.displayInvoices();
  } else if (sectionId === 'amend-orders') {
    adminDB.displayAmendOrders();
  } else if (sectionId === 'membership-approvals') {
    adminDB.displayPendingApprovals();
  }
}

function showAddOrderModal() {
  // This would show a modal to add new orders
  alert('Add new order functionality would be implemented here');
}

function showAddProductModal() {
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  
  // Clear weight fields
  document.getElementById('product-is-weight-based').checked = false;
  document.getElementById('product-default-weight').value = '';
  document.getElementById('default-weight-group').style.display = 'none';
  
  document.getElementById('product-form').onsubmit = (e) => {
    e.preventDefault();
    adminDB.handleAddProduct();
  };
  adminDB.showModal('product-modal');
}

function generateInvoice() {
  // This would show a modal to generate new invoices
  alert('Generate invoice functionality - select an order to create invoice');
}

function closeModal(modalId) {
  adminDB.closeModal(modalId);
}

function searchOrders(query) {
  adminDB.searchOrders(query);
}

function searchProducts(query) {
  adminDB.searchProducts(query);
}

function searchInvoices(query) {
  adminDB.searchInvoices(query);
}

function searchCustomers(query) {
  adminDB.searchCustomers(query);
}

function searchAmendOrders(query) {
  adminDB.searchAmendOrders(query);
}

function refreshAmendOrders() {
  adminDB.displayAmendOrders();
}

function exportAmendedOrders() {
  const amendedOrders = adminDB.orders.filter(order => order.amended);
  const csvContent = "data:text/csv;charset=utf-8," + 
    "Order ID,Customer,Date,Original Total,Amended Total,Status\n" +
    amendedOrders.map(order => 
      `${order.id},"${order.customer || order.name}","${new Date(order.date || order.createdAt).toLocaleDateString()}","${(order.total || order.grandTotal || 0).toFixed(2)}","${(order.amendedTotal || 0).toFixed(2)}","${order.status}"`
    ).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "amended_orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function refreshPendingApprovals() {
  adminDB.loadPendingApprovals();
}

function searchPendingApprovals(query) {
  adminDB.searchPendingApprovals(query);
}

function exportApprovals() {
  const csvContent = "data:text/csv;charset=utf-8," + 
    "Username,Full Name,Email,Phone,Member Type,Applied Date,Status\n" +
    adminDB.pendingApprovals.map(app => 
      `"${app.username}","${app.profile.fullName}","${app.profile.email}","${app.profile.phone}","${app.profile.memberType}","${new Date(app.appliedAt).toLocaleDateString()}","${app.status}"`
    ).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "pending_approvals.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportOrders() {
  adminDB.exportOrders();
}

function exportProducts() {
  adminDB.exportProducts();
}

function exportInvoices() {
  adminDB.exportInvoices();
}

function exportCustomers() {
  adminDB.exportCustomers();
}

function generateSalesReport() {
  adminDB.generateSalesReport();
}

function generateProductReport() {
  adminDB.generateProductReport();
}

function generateCustomerReport() {
  adminDB.generateCustomerReport();
}

function generateOrderReport() {
  adminDB.generateOrderReport();
}

function saveSettings() {
  adminDB.saveSettings();
}

function viewShoppingPage() {
  window.open('shopping.html', '_blank');
}

function resetProducts() {
  if (confirm('This will reset all products to defaults and remove any custom products you added. Are you sure?')) {
    localStorage.removeItem('admin_products');
    adminDB.products = adminDB.getDefaultProducts();
    localStorage.setItem('admin_products', JSON.stringify(adminDB.products));
    adminDB.displayProducts();
    adminDB.updateDashboard();
    alert('Products have been reset to defaults. The shopping page should now work properly.');
  }
}

// Initialize the admin database
let adminDB;
document.addEventListener('DOMContentLoaded', function() {
  adminDB = new AdminDatabase();
});
