// POS System for Grazin Acres Admin
// Handles in-person sales, inventory management, and transaction processing

class POSSystem {
  constructor() {
    this.cart = [];
    this.currentCustomer = null;
    this.paymentMethod = 'cash';
    this.taxRate = 0.0825; // 8.25% tax rate
    this.products = [];
    this.sales = [];
    this.customers = [];
    this.isScanning = false;
    this.currentStream = null;
    this.availableCameras = [];
    this.currentCameraIndex = 0;
    this.quaggaRunning = false;
    
    this.initializeData();
    this.bindEvents();
    this.init();
  }

  initializeData() {
    // Load products from admin system
    this.loadProductsFromAdmin();
    
    // If no admin products, use sample data
    if (this.products.length === 0) {
      this.products = this.getSampleProducts();
    }
    
    // Add barcodes to products if they don't have them
    this.addBarcodesToProducts();
    
    // Load members from admin system instead of sample customers
    this.loadMembersFromAdmin();
    this.sales = JSON.parse(localStorage.getItem('pos_sales')) || [];
  }

  addBarcodesToProducts() {
    // Add sample barcodes to products for testing
    this.products.forEach((product, index) => {
      if (!product.barcode) {
        // Generate a simple barcode for testing (EAN-13 format)
        const baseCode = '123456789';
        const productCode = String(index + 1).padStart(3, '0');
        product.barcode = baseCode + productCode + '0'; // Last digit would be check digit
      }
    });
  }

  loadMembersFromAdmin() {
    try {
      // Try to get customers from admin database system
      const adminCustomers = localStorage.getItem('admin_customers');
      if (adminCustomers) {
        const parsed = JSON.parse(adminCustomers);
        this.customers = parsed.map(customer => ({
          id: customer.id,
          name: customer.profile?.fullName || customer.username,
          phone: customer.profile?.phone || '',
          email: customer.profile?.email || '',
          memberType: customer.profile?.memberType || 'individual',
          joinDate: customer.profile?.createdAt,
          totalSpent: 0, // Will be calculated from sales history
          visits: 0      // Will be calculated from sales history
        }));
        console.log(`Loaded ${this.customers.length} members from admin system`);
      } else {
        // If no admin data, check for API data or fallback
        this.loadMembersFromAPI();
      }
    } catch (error) {
      console.error('Error loading admin customers:', error);
      this.loadMembersFromAPI();
    }
  }

  async loadMembersFromAPI() {
    try {
      // Try to fetch from the same API that admin uses
      const response = await fetch('/debug/users');
      if (response.ok) {
        const apiCustomers = await response.json();
        this.customers = apiCustomers.map(customer => ({
          id: customer.id,
          name: customer.profile?.fullName || customer.username,
          phone: customer.profile?.phone || '',
          email: customer.profile?.email || '',
          memberType: customer.profile?.memberType || 'individual',
          joinDate: customer.profile?.createdAt,
          totalSpent: this.calculateCustomerSpent(customer.id),
          visits: this.calculateCustomerVisits(customer.id)
        }));
        console.log(`Loaded ${this.customers.length} members from API`);
      } else {
        // If API fails, use empty array (members only)
        this.customers = [];
        console.log('No members loaded - POS will only work with existing members');
      }
    } catch (error) {
      console.error('Error loading members from API:', error);
      this.customers = [];
      console.log('No members loaded - POS will only work with existing members');
    }
  }

  calculateCustomerSpent(customerId) {
    return this.sales
      .filter(sale => sale.customer.id === customerId)
      .reduce((total, sale) => total + sale.total, 0);
  }

  calculateCustomerVisits(customerId) {
    return this.sales.filter(sale => sale.customer.id === customerId).length;
  }

  loadProductsFromAdmin() {
    try {
      const adminProducts = localStorage.getItem('admin_products');
      if (adminProducts) {
        const parsed = JSON.parse(adminProducts);
        // Only load active products for POS
        this.products = parsed
          .filter(product => product && product.status === 'active')
          .map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price),
            stock: parseInt(product.stock),
            unit: product.unit,
            icon: this.getCategoryIcon(product.category),
            image: product.image,
            description: product.description,
            isWeightBased: product.isWeightBased || false,
            defaultWeight: product.defaultWeight || 1.0
          }));
        console.log(`Loaded ${this.products.length} products from admin system`);
      }
    } catch (error) {
      console.error('Error loading admin products:', error);
      this.products = [];
    }
  }

  getCategoryIcon(category) {
    const icons = {
      'dairy': '🥛',
      'eggs': '🥚',
      'meat': '🥩',
      'vegetables': '🥕',
      'fruits': '🍎',
      'honey': '🍯',
      'grains': '🌾',
      'produce': '🥬',
      'pantry': '🍯'
    };
    return icons[category] || '🛒';
  }

  getSampleProducts() {
    // Fallback sample products if admin system is not available
    return [
      {
        id: 'prod_001',
        name: 'Farm Fresh Eggs',
        category: 'dairy',
        price: 6.00,
        stock: 24,
        unit: 'dozen',
        icon: '🥚',
        isWeightBased: false,
        defaultWeight: null
      },
      {
        id: 'prod_002',
        name: 'Raw Local Honey',
        category: 'pantry',
        price: 12.00,
        stock: 15,
        unit: 'jar',
        icon: '🍯',
        isWeightBased: false,
        defaultWeight: null
      },
      {
        id: 'prod_003',
        name: 'Organic Tomatoes',
        category: 'produce',
        price: 4.50,
        stock: 30,
        unit: 'lb',
        icon: '🍅',
        isWeightBased: true,
        defaultWeight: 1.0
      },
      {
        id: 'prod_005',
        name: 'Grass-Fed Ground Beef',
        category: 'meat',
        price: 8.50,
        stock: 12,
        unit: 'lb',
        icon: '🥩',
        isWeightBased: true,
        defaultWeight: 1.0
      }
    ];
  }

  getSampleCustomers() {
    return [
      {
        id: 'cust_001',
        name: 'John Smith',
        phone: '555-0123',
        email: 'john@example.com',
        totalSpent: 245.50,
        visits: 12
      },
      {
        id: 'cust_002',
        name: 'Sarah Johnson',
        phone: '555-0456',
        email: 'sarah@example.com',
        totalSpent: 178.25,
        visits: 8
      }
    ];
  }

  init() {
    this.renderProducts();
    this.updateCartDisplay();
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterProducts(e.target.value);
      });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filterProducts('', e.target.value);
      });
    }

    // Payment method buttons
    const paymentBtns = document.querySelectorAll('.payment-btn');
    paymentBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectPaymentMethod(e.target.dataset.method);
      });
    });

    // Customer search
    const customerSearch = document.getElementById('customer-search');
    if (customerSearch) {
      customerSearch.addEventListener('input', (e) => {
        this.searchCustomers(e.target.value);
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.processCheckout();
      });
    }
  }

  renderProducts(filteredProducts = null) {
    const productsToRender = filteredProducts || this.products;
    const productGrid = document.getElementById('products-grid');
    
    if (!productGrid) return;

    productGrid.innerHTML = productsToRender.map(product => `
      <div class="product-card" onclick="posSystem.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
        <div class="product-image">${product.icon}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">$${product.price.toFixed(2)}/${product.unit}</div>
        <div class="product-stock">Stock: ${product.stock}</div>
        <div class="product-barcode" style="font-size: 0.7em; color: #999; margin-top: 5px;">📊 ${product.barcode}</div>
        ${product.isWeightBased ? '<span class="weight-badge">⚖️ Weight Item</span>' : ''}
      </div>
    `).join('');

    // Update products count
    const productsCount = document.getElementById('products-count');
    if (productsCount) {
      productsCount.textContent = `${productsToRender.length} items`;
    }
  }

  filterProducts(searchTerm = '', category = '') {
    let filtered = this.products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    this.renderProducts(filtered);
  }

  addToCart(product) {
    if (product.isWeightBased) {
      this.showWeightModal(product);
    } else {
      this.addProductToCart(product, 1);
    }
  }

  showWeightModal(product) {
    const modal = document.getElementById('weight-modal');
    const modalContent = document.getElementById('weight-modal-content');
    
    modalContent.innerHTML = `
      <h3>Enter Weight for ${product.name}</h3>
      <div class="weight-input-group">
        <label>Weight (${product.unit}):</label>
        <input type="number" id="weight-input" value="${product.defaultWeight || 1.0}" step="0.1" min="0.1">
        <div class="weight-buttons">
          <button onclick="posSystem.adjustWeight(-0.1)" class="weight-btn">-0.1</button>
          <button onclick="posSystem.adjustWeight(-0.5)" class="weight-btn">-0.5</button>
          <button onclick="posSystem.adjustWeight(0.1)" class="weight-btn">+0.1</button>
          <button onclick="posSystem.adjustWeight(0.5)" class="weight-btn">+0.5</button>
        </div>
      </div>
      <div class="price-preview">
        <strong>Price: $<span id="weight-price">${(product.price * (product.defaultWeight || 1.0)).toFixed(2)}</span></strong>
      </div>
      <div class="modal-buttons">
        <button onclick="posSystem.closeWeightModal()" class="btn btn-secondary">Cancel</button>
        <button onclick="posSystem.confirmWeight(${JSON.stringify(product).replace(/"/g, '&quot;')})" class="btn btn-primary">Add to Cart</button>
      </div>
    `;
    
    modal.style.display = 'block';
    
    // Update price on weight change
    const weightInput = document.getElementById('weight-input');
    weightInput.addEventListener('input', () => {
      const weight = parseFloat(weightInput.value) || 0;
      document.getElementById('weight-price').textContent = (product.price * weight).toFixed(2);
    });
  }

  adjustWeight(amount) {
    const weightInput = document.getElementById('weight-input');
    const currentWeight = parseFloat(weightInput.value) || 0;
    const newWeight = Math.max(0.1, currentWeight + amount);
    weightInput.value = newWeight.toFixed(1);
    
    // Trigger input event to update price
    weightInput.dispatchEvent(new Event('input'));
  }

  confirmWeight(product) {
    const weight = parseFloat(document.getElementById('weight-input').value) || 1;
    this.addProductToCart(product, 1, weight);
    this.closeWeightModal();
    
    // If we came from barcode scanning, close the scanner too
    if (this.isScanning) {
      this.stopBarcodeScanning();
    }
  }

  closeWeightModal() {
    document.getElementById('weight-modal').style.display = 'none';
  }

  addProductToCart(product, quantity = 1, weight = null) {
    const existingItem = this.cart.find(item => 
      item.id === product.id && 
      (!weight || item.weight === weight)
    );

    if (existingItem && !product.isWeightBased) {
      existingItem.quantity += quantity;
    } else {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        unit: product.unit,
        weight: weight,
        isWeightBased: product.isWeightBased,
        totalPrice: weight ? product.price * weight : product.price * quantity
      };
      this.cart.push(cartItem);
    }

    this.updateCartDisplay();
  }

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.updateCartDisplay();
  }

  updateQuantity(index, change) {
    const item = this.cart[index];
    if (item.isWeightBased) {
      // For weight items, adjust weight instead of quantity
      const newWeight = Math.max(0.1, (item.weight || 1) + (change * 0.1));
      item.weight = parseFloat(newWeight.toFixed(1));
      item.totalPrice = item.price * item.weight;
    } else {
      item.quantity = Math.max(1, item.quantity + change);
      item.totalPrice = item.price * item.quantity;
    }
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const cartCount = document.getElementById('cart-count');

    if (!cartContent) return;

    if (this.cart.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart">
          <p>🛒 Cart is empty</p>
          <p>Add products to start a sale</p>
        </div>
      `;
      if (cartSummary) cartSummary.style.display = 'none';
      if (cartCount) cartCount.textContent = '0 items';
    } else {
      // Render cart items
      cartContent.innerHTML = this.cart.map((item, index) => `
        <div class="cart-item">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-price">
              ${item.isWeightBased ? 
                `${item.weight} ${item.unit} @ $${item.price.toFixed(2)}/${item.unit}` :
                `${item.quantity} × $${item.price.toFixed(2)}`
              }
            </div>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="posSystem.updateQuantity(${index}, -1)">-</button>
              <span class="quantity">
                ${item.isWeightBased ? `${item.weight}${item.unit}` : item.quantity}
              </span>
              <button class="qty-btn" onclick="posSystem.updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
          <div class="item-total">$${item.totalPrice.toFixed(2)}</div>
          <button class="remove-item" onclick="posSystem.removeFromCart(${index})">Remove</button>
        </div>
      `).join('');

      if (cartSummary) cartSummary.style.display = 'block';
      if (cartCount) cartCount.textContent = `${this.cart.length} items`;
    }

    // Calculate totals
    const subtotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    this.updateCheckoutButton();
  }

  selectPaymentMethod(method) {
    this.paymentMethod = method;
    
    // Update button states
    document.querySelectorAll('.payment-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
  }

  searchCustomers(searchTerm) {
    if (!searchTerm.trim()) {
      const customerSuggestions = document.getElementById('customer-suggestions');
      if (customerSuggestions) {
        customerSuggestions.style.display = 'none';
        customerSuggestions.innerHTML = '';
      }
      return;
    }

    // Only search through existing members
    const results = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const customerSuggestions = document.getElementById('customer-suggestions');
    if (customerSuggestions) {
      if (results.length > 0) {
        customerSuggestions.style.display = 'block';
        customerSuggestions.innerHTML = results.map(customer => `
          <div class="customer-suggestion" onclick="posSystem.selectCustomer(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
            <div class="customer-name">${customer.name}</div>
            <div class="customer-details">${customer.phone} • ${customer.email}</div>
            <div class="customer-member-info">Member since: ${new Date(customer.joinDate).toLocaleDateString()} • Type: ${customer.memberType}</div>
          </div>
        `).join('');
      } else {
        customerSuggestions.style.display = 'block';
        customerSuggestions.innerHTML = `
          <div class="customer-suggestion" style="color: #666; font-style: italic;">
            <div class="customer-name">No members found</div>
            <div class="customer-details">Only existing members can make purchases</div>
            <div class="customer-member-info">Contact admin to add new members</div>
          </div>
        `;
      }
    }
  }

  selectCustomer(customer) {
    this.currentCustomer = customer;
    document.getElementById('customer-search').value = customer.name;
    document.getElementById('customer-email').value = customer.email;
    document.getElementById('customer-suggestions').style.display = 'none';
    
    // Update checkout button state
    this.updateCheckoutButton();
    
    // Show member info confirmation
    console.log(`Selected member: ${customer.name} (${customer.memberType})`);
  }

  updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      const hasItems = this.cart.length > 0;
      const hasMember = this.currentCustomer && this.currentCustomer.id;
      
      checkoutBtn.disabled = !hasItems || !hasMember;
      
      if (!hasItems) {
        checkoutBtn.textContent = 'Add Items to Cart';
      } else if (!hasMember) {
        checkoutBtn.textContent = 'Select Member to Continue';
      } else {
        checkoutBtn.textContent = 'Complete Sale';
      }
    }
  }

  processCheckout() {
    if (this.cart.length === 0) {
      alert('Cart is empty. Add products before checkout.');
      return;
    }

    // Validate that a member is selected
    if (!this.currentCustomer || !this.currentCustomer.id) {
      alert('Please select a member before completing the sale.\n\nOnly existing members can make purchases. Contact admin to add new members.');
      document.getElementById('customer-search').focus();
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    const sale = {
      id: 'POS-' + Date.now(),
      timestamp: new Date().toISOString(),
      customer: {
        id: this.currentCustomer.id,
        name: this.currentCustomer.name,
        phone: this.currentCustomer.phone,
        email: this.currentCustomer.email,
        memberType: this.currentCustomer.memberType
      },
      items: [...this.cart],
      subtotal: subtotal,
      tax: tax,
      total: total,
      paymentMethod: this.paymentMethod,
      cashier: localStorage.getItem('loggedInUser') || 'Admin'
    };

    // Save sale
    this.sales.push(sale);
    localStorage.setItem('pos_sales', JSON.stringify(this.sales));

    // Update customer statistics
    this.updateCustomerStats(this.currentCustomer.id, total);

    // Update product inventory
    this.updateInventory();

    // Show receipt
    this.showReceipt(sale);

    // Reset for next sale
    this.resetTransaction();
  }

  updateCustomerStats(customerId, saleAmount) {
    // Update customer in POS system
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customer.totalSpent += saleAmount;
      customer.visits += 1;
    }

    // Save updated customer stats
    localStorage.setItem('pos_customers', JSON.stringify(this.customers));
  }

  updateInventory() {
    this.cart.forEach(cartItem => {
      const product = this.products.find(p => p.id === cartItem.id);
      if (product) {
        if (cartItem.isWeightBased) {
          // For weight-based items, reduce stock by weight
          product.stock -= cartItem.weight;
        } else {
          // For quantity-based items, reduce stock by quantity
          product.stock -= cartItem.quantity;
        }
        product.stock = Math.max(0, product.stock);
      }
    });

    // Update admin products if they exist
    try {
      const adminProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
      this.cart.forEach(cartItem => {
        const adminProduct = adminProducts.find(p => p.id === cartItem.id);
        if (adminProduct) {
          if (cartItem.isWeightBased) {
            adminProduct.stock -= cartItem.weight;
          } else {
            adminProduct.stock -= cartItem.quantity;
          }
          adminProduct.stock = Math.max(0, adminProduct.stock);
        }
      });
      localStorage.setItem('admin_products', JSON.stringify(adminProducts));
    } catch (error) {
      console.log('No admin products to update');
    }
  }

  showReceipt(sale) {
    const modal = document.getElementById('receipt-modal');
    const receiptContent = document.getElementById('receipt-content');
    
    receiptContent.innerHTML = `
      <div class="receipt-header">
        <h2>🌾 Grazin Acres Farm</h2>
        <p>Fresh from Farm to Table</p>
        <hr>
      </div>
      
      <div class="receipt-details">
        <p><strong>Receipt #:</strong> ${sale.id}</p>
        <p><strong>Date:</strong> ${new Date(sale.timestamp).toLocaleString()}</p>
        <p><strong>Customer:</strong> ${sale.customer.name}</p>
        <p><strong>Cashier:</strong> ${sale.cashier}</p>
        <hr>
      </div>
      
      <div class="receipt-items">
        ${sale.items.map(item => `
          <div class="receipt-item">
            <div class="item-row">
              <span>${item.name}</span>
              <span>$${item.totalPrice.toFixed(2)}</span>
            </div>
            <div class="item-details">
              ${item.isWeightBased ? 
                `${item.weight} ${item.unit} @ $${item.price.toFixed(2)}/${item.unit}` :
                `${item.quantity} × $${item.price.toFixed(2)}`
              }
            </div>
          </div>
        `).join('')}
        <hr>
      </div>
      
      <div class="receipt-totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${sale.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Tax (8.25%):</span>
          <span>$${sale.tax.toFixed(2)}</span>
        </div>
        <div class="total-row final-total">
          <span><strong>Total:</strong></span>
          <span><strong>$${sale.total.toFixed(2)}</strong></span>
        </div>
        <div class="total-row">
          <span>Payment Method:</span>
          <span>${this.paymentMethod.toUpperCase()}</span>
        </div>
      </div>
      
      <div class="receipt-footer">
        <hr>
        <p>Thank you for supporting local agriculture!</p>
        <p>Visit us at grazinacres.com</p>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  printReceipt() {
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Grazin Acres</title>
          <style>
            body { font-family: monospace; max-width: 300px; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-item { margin-bottom: 10px; }
            .item-row { display: flex; justify-content: space-between; }
            .item-details { font-size: 0.9em; color: #666; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { border-top: 2px solid #000; padding-top: 10px; }
            hr { border: none; border-top: 1px solid #000; margin: 10px 0; }
          </style>
        </head>
        <body>${receiptContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  emailReceipt() {
    if (!this.currentCustomer || !this.currentCustomer.email) {
      alert('No customer email address available');
      return;
    }

    // This would integrate with your email service
    alert(`Receipt would be emailed to ${this.currentCustomer.email}`);
  }

  closeReceiptModal() {
    document.getElementById('receipt-modal').style.display = 'none';
  }

  resetTransaction() {
    this.cart = [];
    this.currentCustomer = null;
    this.paymentMethod = 'cash';
    
    // Reset UI
    const customerSearch = document.getElementById('customer-search');
    const customerEmail = document.getElementById('customer-email');
    const customerSuggestions = document.getElementById('customer-suggestions');
    
    if (customerSearch) customerSearch.value = '';
    if (customerEmail) customerEmail.value = '';
    if (customerSuggestions) customerSuggestions.style.display = 'none';
    
    // Reset payment method buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const cashBtn = document.querySelector('[data-method="cash"]');
    if (cashBtn) cashBtn.classList.add('active');
    
    this.updateCartDisplay();
  }

  // Barcode Scanning Functions
  async startBarcodeScanning() {
    const modal = document.getElementById('barcode-scanner-modal');
    const video = document.getElementById('scanner-video');
    const statusEl = document.getElementById('scanner-status');
    const manualInput = document.getElementById('manual-barcode');
    
    modal.style.display = 'flex';
    statusEl.textContent = 'Initializing camera...';
    manualInput.value = '';
    manualInput.focus();
    
    try {
      // Get available cameras
      await this.getCameraDevices();
      
      // Start camera stream
      await this.startCameraStream();
      
      // Initialize Quagga barcode scanner
      this.initializeQuagga();
      
      this.isScanning = true;
      statusEl.textContent = 'Scanner ready! Position barcode in the red line area.';
      
      // Set up manual input listener
      manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.processManualBarcode();
        }
      });
      
    } catch (error) {
      console.error('Camera access error:', error);
      statusEl.textContent = 'Camera not available. Please use manual input.';
      statusEl.style.color = '#dc3545';
    }
  }

  async getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');
      
      // Show switch camera button if multiple cameras available
      const switchBtn = document.getElementById('switch-camera-btn');
      if (this.availableCameras.length > 1) {
        switchBtn.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error getting camera devices:', error);
    }
  }

  async startCameraStream() {
    const video = document.getElementById('scanner-video');
    
    // Stop existing stream
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
    
    const constraints = {
      video: {
        facingMode: 'environment', // Prefer back camera
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };
    
    // Use specific camera if available
    if (this.availableCameras.length > 0) {
      const selectedCamera = this.availableCameras[this.currentCameraIndex];
      constraints.video.deviceId = { exact: selectedCamera.deviceId };
    }
    
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.currentStream;
      await video.play();
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  }

  initializeQuagga() {
    if (typeof Quagga === 'undefined') {
      console.warn('Quagga library not loaded. Manual input only.');
      return;
    }
    
    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector('#scanner-video'),
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true,
        locator: {
          halfSample: true,
          patchSize: "medium"
        }
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          this.quaggaRunning = false;
          return;
        }
        
        try {
          Quagga.start();
          this.quaggaRunning = true;
          console.log('Quagga started successfully');
          
          // Listen for barcode detection
          Quagga.onDetected((data) => {
            if (this.isScanning) {
              const code = data.codeResult.code;
              this.processBarcodeResult(code);
            }
          });
        } catch (startError) {
          console.error('Error starting Quagga:', startError);
          this.quaggaRunning = false;
        }
      });
    } catch (error) {
      console.error('Error initializing Quagga:', error);
      this.quaggaRunning = false;
    }
  }

  processBarcodeResult(barcode) {
    const statusEl = document.getElementById('scanner-status');
    const manualInput = document.getElementById('manual-barcode');
    
    // Find product by barcode
    const product = this.products.find(p => p.barcode === barcode);
    
    if (product) {
      statusEl.textContent = `Found: ${product.name}`;
      statusEl.style.color = '#28a745';
      manualInput.value = barcode;
      
      // Check if it's a weight-based product
      if (product.isWeightBased) {
        // For weight-based products, show weight modal first
        setTimeout(() => {
          this.showWeightModal(product);
          // Don't close scanner yet - weight modal will handle it
        }, 1000);
      } else {
        // For regular products, add to cart and close scanner
        setTimeout(() => {
          this.addToCart(product);
          this.stopBarcodeScanning();
        }, 1000);
      }
    } else {
      statusEl.textContent = `Product not found: ${barcode}`;
      statusEl.style.color = '#dc3545';
      manualInput.value = barcode;
    }
  }

  processManualBarcode() {
    const manualInput = document.getElementById('manual-barcode');
    const barcode = manualInput.value.trim();
    
    if (barcode) {
      this.processBarcodeResult(barcode);
    }
  }

  switchCamera() {
    if (this.availableCameras.length > 1) {
      this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
      this.startCameraStream();
    }
  }

  stopBarcodeScanning() {
    console.log('stopBarcodeScanning called');
    this.isScanning = false;
    
    try {
      // Stop Quagga only if it's running
      if (typeof Quagga !== 'undefined' && this.quaggaRunning) {
        console.log('Stopping Quagga...');
        try {
          Quagga.stop();
          this.quaggaRunning = false;
          console.log('Quagga stopped successfully');
        } catch (quaggaError) {
          console.error('Error stopping Quagga:', quaggaError);
          this.quaggaRunning = false;
        }
      } else {
        console.log('Quagga not running or not available');
      }
      
      // Stop camera stream
      if (this.currentStream) {
        console.log('Stopping camera stream...');
        this.currentStream.getTracks().forEach(track => track.stop());
        this.currentStream = null;
      }
      
      // Hide modal
      const modal = document.getElementById('barcode-scanner-modal');
      if (modal) {
        console.log('Hiding modal...');
        modal.style.display = 'none';
      } else {
        console.error('Modal not found');
      }
      
      // Reset status
      const statusEl = document.getElementById('scanner-status');
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.style.color = '#2e8b57';
      }
      
      // Clear manual input
      const manualInput = document.getElementById('manual-barcode');
      if (manualInput) {
        manualInput.value = '';
      }
      
      console.log('Scanner closed successfully');
    } catch (error) {
      console.error('Error closing scanner:', error);
      
      // Force close everything even if there are errors
      try {
        this.quaggaRunning = false;
        if (this.currentStream) {
          this.currentStream.getTracks().forEach(track => track.stop());
          this.currentStream = null;
        }
        const modal = document.getElementById('barcode-scanner-modal');
        if (modal) {
          modal.style.display = 'none';
        }
      } catch (forceError) {
        console.error('Error in force close:', forceError);
      }
    }
  }
}

// Global functions for HTML onclick handlers
function clearCart() {
  if (posSystem) {
    posSystem.cart = [];
    posSystem.updateCartDisplay();
  }
}

function holdTransaction() {
  if (posSystem && posSystem.cart.length > 0) {
    const heldTransactions = JSON.parse(localStorage.getItem('held_transactions') || '[]');
    heldTransactions.push({
      id: 'HOLD-' + Date.now(),
      cart: [...posSystem.cart],
      customer: posSystem.currentCustomer,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('held_transactions', JSON.stringify(heldTransactions));
    alert('Transaction held successfully');
    posSystem.resetTransaction();
  }
}

// Global function for close scanner button
function closeBarcodeScanner() {
  console.log('closeBarcodeScanner global function called');
  if (posSystem && typeof posSystem.stopBarcodeScanning === 'function') {
    posSystem.stopBarcodeScanning();
  } else {
    console.error('posSystem not available or stopBarcodeScanning not a function');
  }
}

// Initialize POS system when page loads
let posSystem;
document.addEventListener('DOMContentLoaded', function() {
  // Check if admin is authenticated before initializing
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  if (isAdminAuthenticated && loggedInUser) {
    posSystem = new POSSystem();
    console.log('POS System initialized successfully');
  } else {
    console.log('Admin not authenticated, POS system not initialized');
  }
});
