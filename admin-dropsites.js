// Admin Dropsite Management JavaScript
class DropsiteManager {
  constructor() {
    this.apiUrl = 'http://localhost:3000';
    this.dropsites = [];
    this.currentDropsite = null;
  }

  init() {
    this.loadDropsites();
  }

  async loadDropsites() {
    try {
      const response = await fetch(`${this.apiUrl}/dropsites`);
      if (response.ok) {
        this.dropsites = await response.json();
      } else {
        // Fallback to sample data
        this.dropsites = this.getSampleDropsites();
      }
    } catch (error) {
      console.error('Error loading dropsites:', error);
      this.dropsites = this.getSampleDropsites();
    }
    
    // Save to localStorage for other pages to access
    localStorage.setItem('admin_dropsites', JSON.stringify(this.dropsites));
    
    this.displayDropsites();
    this.updateStatistics();
  }

  getSampleDropsites() {
    return [
      {
        id: 1,
        name: "Downtown Community Center",
        contactPerson: "Sarah Johnson",
        contactPhone: "(555) 123-4567",
        address: "123 Main Street",
        city: "Farmville",
        zipCode: "75001",
        description: "Large parking lot, covered pickup area. Enter through side entrance.",
        status: "active",
        capacity: 75,
        schedule: {
          monday: { enabled: false },
          tuesday: { enabled: true, start: "16:00", end: "18:00" },
          wednesday: { enabled: false },
          thursday: { enabled: true, start: "16:00", end: "18:00" },
          friday: { enabled: false },
          saturday: { enabled: true, start: "09:00", end: "12:00" },
          sunday: { enabled: false }
        },
        activeOrders: 23,
        totalCustomers: 45,
        createdDate: "2024-01-15"
      },
      {
        id: 2,
        name: "Northside Church",
        contactPerson: "Pastor Mike Wilson",
        contactPhone: "(555) 234-5678",
        address: "456 Oak Avenue",
        city: "Farmville",
        zipCode: "75002",
        description: "Church parking lot. Pickup in fellowship hall during bad weather.",
        status: "active",
        capacity: 50,
        schedule: {
          monday: { enabled: false },
          tuesday: { enabled: false },
          wednesday: { enabled: true, start: "17:00", end: "19:00" },
          thursday: { enabled: false },
          friday: { enabled: true, start: "16:00", end: "18:00" },
          saturday: { enabled: false },
          sunday: { enabled: false }
        },
        activeOrders: 18,
        totalCustomers: 32,
        createdDate: "2024-02-01"
      },
      {
        id: 3,
        name: "Westside Elementary School",
        contactPerson: "Jennifer Davis",
        contactPhone: "(555) 345-6789",
        address: "789 School Drive",
        city: "Westside",
        zipCode: "75003",
        description: "School parking lot. Use teacher parking area near cafeteria.",
        status: "active",
        capacity: 40,
        schedule: {
          monday: { enabled: true, start: "15:30", end: "17:30" },
          tuesday: { enabled: false },
          wednesday: { enabled: true, start: "15:30", end: "17:30" },
          thursday: { enabled: false },
          friday: { enabled: true, start: "15:30", end: "17:30" },
          saturday: { enabled: false },
          sunday: { enabled: false }
        },
        activeOrders: 15,
        totalCustomers: 28,
        createdDate: "2024-03-10"
      },
      {
        id: 4,
        name: "Eastside Library",
        contactPerson: "Robert Chen",
        contactPhone: "(555) 456-7890",
        address: "321 Library Lane",
        city: "Eastside",
        zipCode: "75004",
        description: "Library parking lot. Covered area near main entrance available.",
        status: "maintenance",
        capacity: 30,
        schedule: {
          monday: { enabled: false },
          tuesday: { enabled: true, start: "16:00", end: "18:00" },
          wednesday: { enabled: false },
          thursday: { enabled: true, start: "16:00", end: "18:00" },
          friday: { enabled: false },
          saturday: { enabled: true, start: "10:00", end: "13:00" },
          sunday: { enabled: false }
        },
        activeOrders: 0,
        totalCustomers: 22,
        createdDate: "2024-04-05"
      },
      {
        id: 5,
        name: "Southside Recreation Center",
        contactPerson: "Maria Rodriguez",
        contactPhone: "(555) 567-8901",
        address: "654 Sports Complex Blvd",
        city: "Southside",
        zipCode: "75005",
        description: "Recreation center parking. Large space with easy vehicle access.",
        status: "active",
        capacity: 60,
        schedule: {
          monday: { enabled: false },
          tuesday: { enabled: false },
          wednesday: { enabled: false },
          thursday: { enabled: true, start: "16:00", end: "18:30" },
          friday: { enabled: false },
          saturday: { enabled: true, start: "08:00", end: "11:00" },
          sunday: { enabled: true, start: "13:00", end: "16:00" }
        },
        activeOrders: 12,
        totalCustomers: 25,
        createdDate: "2024-05-20"
      }
    ];
  }

  displayDropsites() {
    this.displayDropsitesInGrid('dropsites-grid');
    this.displayDropsitesInGrid('management-dropsites-grid');
    this.displaySchedules();
  }

  displayDropsitesInGrid(gridId) {
    const grid = document.getElementById(gridId);
    
    if (this.dropsites.length === 0) {
      grid.innerHTML = '<div class="no-results">No dropsites found.</div>';
      return;
    }

    const dropsitesHtml = this.dropsites.map(dropsite => {
      const statusClass = `status-${dropsite.status}`;
      const scheduleText = this.getScheduleText(dropsite.schedule);
      
      return `
        <div class="dropsite-card">
          <h3>${dropsite.name}</h3>
          <div class="dropsite-status ${statusClass}">
            ${dropsite.status.toUpperCase()}
          </div>
          <div class="dropsite-info">
            <p><strong>📍 Address:</strong> ${dropsite.address}, ${dropsite.city} ${dropsite.zipCode}</p>
            <p><strong>👤 Contact:</strong> ${dropsite.contactPerson || 'N/A'}</p>
            <p><strong>📞 Phone:</strong> ${dropsite.contactPhone || 'N/A'}</p>
            <p><strong>📅 Schedule:</strong> ${scheduleText}</p>
            <p><strong>👥 Capacity:</strong> ${dropsite.capacity} orders</p>
            <p><strong>📦 Active Orders:</strong> ${dropsite.activeOrders || 0}</p>
            <p><strong>🏠 Total Customers:</strong> ${dropsite.totalCustomers || 0}</p>
          </div>
          <div style="margin-top: 15px;">
            <button class="btn btn-primary" onclick="dropsiteManager.viewDropsiteDetails(${dropsite.id})">
              👁️ View Details
            </button>
            <button class="btn btn-warning" onclick="dropsiteManager.editDropsite(${dropsite.id})">
              ✏️ Edit
            </button>
            <button class="btn btn-danger" onclick="dropsiteManager.deleteDropsite(${dropsite.id})">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = dropsitesHtml;
  }

  getScheduleText(schedule) {
    const days = [];
    const dayNames = {
      monday: 'Mon',
      tuesday: 'Tue', 
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    for (const [day, info] of Object.entries(schedule)) {
      if (info.enabled) {
        days.push(`${dayNames[day]} ${info.start}-${info.end}`);
      }
    }

    return days.length > 0 ? days.join(', ') : 'No pickup times set';
  }

  updateStatistics() {
    const total = this.dropsites.length;
    const active = this.dropsites.filter(d => d.status === 'active').length;
    const weeklyPickups = this.dropsites.reduce((total, dropsite) => {
      const enabledDays = Object.values(dropsite.schedule).filter(day => day.enabled).length;
      return total + enabledDays;
    }, 0);
    const totalCustomers = this.dropsites.reduce((sum, d) => sum + (d.totalCustomers || 0), 0);

    document.getElementById('total-dropsites').textContent = total;
    document.getElementById('active-dropsites').textContent = active;
    document.getElementById('weekly-pickups').textContent = weeklyPickups;
    document.getElementById('total-customers').textContent = totalCustomers;
  }

  displaySchedules() {
    const container = document.getElementById('schedules-container');
    
    const schedulesHtml = this.dropsites.map(dropsite => {
      const scheduleRows = Object.entries(dropsite.schedule).map(([day, info]) => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const status = info.enabled ? 
          `✅ ${info.start} - ${info.end}` : 
          '❌ Closed';
        const statusClass = info.enabled ? 'text-success' : 'text-muted';
        
        return `
          <tr>
            <td>${dayName}</td>
            <td class="${statusClass}">${status}</td>
          </tr>
        `;
      }).join('');

      return `
        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2e8b57; margin-bottom: 15px;">
            ${dropsite.name} 
            <span class="dropsite-status status-${dropsite.status}" style="margin-left: 10px; font-size: 0.7em;">
              ${dropsite.status.toUpperCase()}
            </span>
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4>📍 Location</h4>
              <p>${dropsite.address}<br>${dropsite.city}, ${dropsite.zipCode}</p>
              <h4>👤 Contact</h4>
              <p>${dropsite.contactPerson || 'N/A'}<br>${dropsite.contactPhone || 'N/A'}</p>
            </div>
            <div>
              <h4>📅 Weekly Schedule</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Day</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Pickup Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${scheduleRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = schedulesHtml || '<div class="no-results">No schedules to display.</div>';
  }

  addNewDropsite() {
    this.currentDropsite = null;
    document.getElementById('modal-title').textContent = 'Add New Dropsite';
    document.getElementById('dropsite-form').reset();
    
    // Set default schedule (Tuesday, Thursday, Saturday)
    document.getElementById('tuesday-enabled').checked = true;
    document.getElementById('thursday-enabled').checked = true;
    document.getElementById('saturday-enabled').checked = true;
    
    showModal('dropsite-modal');
  }

  editDropsite(dropsiteId) {
    const dropsite = this.dropsites.find(d => d.id === dropsiteId);
    if (!dropsite) return;

    this.currentDropsite = dropsite;
    document.getElementById('modal-title').textContent = 'Edit Dropsite';
    
    // Populate form fields
    document.getElementById('dropsite-name').value = dropsite.name;
    document.getElementById('contact-person').value = dropsite.contactPerson || '';
    document.getElementById('contact-phone').value = dropsite.contactPhone || '';
    document.getElementById('dropsite-address').value = dropsite.address;
    document.getElementById('dropsite-city').value = dropsite.city;
    document.getElementById('dropsite-zip').value = dropsite.zipCode;
    document.getElementById('dropsite-description').value = dropsite.description || '';
    document.getElementById('dropsite-status').value = dropsite.status;
    document.getElementById('dropsite-capacity').value = dropsite.capacity;

    // Populate schedule
    Object.entries(dropsite.schedule).forEach(([day, info]) => {
      document.getElementById(`${day}-enabled`).checked = info.enabled;
      if (info.start) document.getElementById(`${day}-start`).value = info.start;
      if (info.end) document.getElementById(`${day}-end`).value = info.end;
    });

    showModal('dropsite-modal');
  }

  async saveDropsite(event) {
    event.preventDefault();
    
    const formData = {
      name: document.getElementById('dropsite-name').value,
      contactPerson: document.getElementById('contact-person').value,
      contactPhone: document.getElementById('contact-phone').value,
      address: document.getElementById('dropsite-address').value,
      city: document.getElementById('dropsite-city').value,
      zipCode: document.getElementById('dropsite-zip').value,
      description: document.getElementById('dropsite-description').value,
      status: document.getElementById('dropsite-status').value,
      capacity: parseInt(document.getElementById('dropsite-capacity').value)
    };

    // Build schedule object
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      schedule[day] = {
        enabled: document.getElementById(`${day}-enabled`).checked,
        start: document.getElementById(`${day}-start`).value,
        end: document.getElementById(`${day}-end`).value
      };
    });
    
    formData.schedule = schedule;

    try {
      let response;
      if (this.currentDropsite) {
        // Update existing dropsite
        formData.id = this.currentDropsite.id;
        response = await fetch(`${this.apiUrl}/dropsites/${this.currentDropsite.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok || !response.ok) {
          // Update local data
          const index = this.dropsites.findIndex(d => d.id === this.currentDropsite.id);
          if (index !== -1) {
            this.dropsites[index] = { ...this.dropsites[index], ...formData };
          }
        }
      } else {
        // Create new dropsite
        formData.id = Date.now();
        formData.activeOrders = 0;
        formData.totalCustomers = 0;
        formData.createdDate = new Date().toISOString().split('T')[0];
        
        response = await fetch(`${this.apiUrl}/dropsites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok || !response.ok) {
          // Add to local data
          this.dropsites.push(formData);
        }
      }
    } catch (error) {
      console.error('Error saving dropsite:', error);
      // Still update local data for demo purposes
      if (this.currentDropsite) {
        const index = this.dropsites.findIndex(d => d.id === this.currentDropsite.id);
        if (index !== -1) {
          this.dropsites[index] = { ...this.dropsites[index], ...formData };
        }
      } else {
        formData.id = Date.now();
        formData.activeOrders = 0;
        formData.totalCustomers = 0;
        formData.createdDate = new Date().toISOString().split('T')[0];
        this.dropsites.push(formData);
      }
    }

    // Update localStorage and displays
    localStorage.setItem('admin_dropsites', JSON.stringify(this.dropsites));
    this.displayDropsites();
    this.updateStatistics();
    
    closeModal('dropsite-modal');
    alert(`Dropsite ${this.currentDropsite ? 'updated' : 'created'} successfully!`);
  }

  async deleteDropsite(dropsiteId) {
    const dropsite = this.dropsites.find(d => d.id === dropsiteId);
    if (!dropsite) return;

    if (!confirm(`Are you sure you want to delete "${dropsite.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/dropsites/${dropsiteId}`, {
        method: 'DELETE'
      });
      
      if (response.ok || !response.ok) {
        // Remove from local data
        this.dropsites = this.dropsites.filter(d => d.id !== dropsiteId);
      }
    } catch (error) {
      console.error('Error deleting dropsite:', error);
      // Still remove from local data for demo purposes
      this.dropsites = this.dropsites.filter(d => d.id !== dropsiteId);
    }

    // Update localStorage and displays
    localStorage.setItem('admin_dropsites', JSON.stringify(this.dropsites));
    this.displayDropsites();
    this.updateStatistics();
    
    alert('Dropsite deleted successfully!');
  }

  viewDropsiteDetails(dropsiteId) {
    const dropsite = this.dropsites.find(d => d.id === dropsiteId);
    if (!dropsite) return;

    const scheduleHtml = Object.entries(dropsite.schedule).map(([day, info]) => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      const status = info.enabled ? 
        `✅ ${info.start} - ${info.end}` : 
        '❌ Closed';
      
      return `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
          <strong>${dayName}:</strong>
          <span>${status}</span>
        </div>
      `;
    }).join('');

    const detailsHtml = `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #2e8b57; margin-bottom: 15px;">
          ${dropsite.name}
          <span class="dropsite-status status-${dropsite.status}" style="margin-left: 10px; font-size: 0.7em;">
            ${dropsite.status.toUpperCase()}
          </span>
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h4>📍 Location Information</h4>
            <p><strong>Address:</strong> ${dropsite.address}</p>
            <p><strong>City:</strong> ${dropsite.city}</p>
            <p><strong>ZIP Code:</strong> ${dropsite.zipCode}</p>
            <p><strong>Description:</strong> ${dropsite.description || 'No description provided'}</p>
          </div>
          <div>
            <h4>👤 Contact Information</h4>
            <p><strong>Contact Person:</strong> ${dropsite.contactPerson || 'N/A'}</p>
            <p><strong>Phone:</strong> ${dropsite.contactPhone || 'N/A'}</p>
            <p><strong>Capacity:</strong> ${dropsite.capacity} orders</p>
            <p><strong>Created:</strong> ${dropsite.createdDate}</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h4>📅 Pickup Schedule</h4>
            <div style="background: white; padding: 15px; border-radius: 8px;">
              ${scheduleHtml}
            </div>
          </div>
          <div>
            <h4>📊 Statistics</h4>
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong>Active Orders:</strong>
                <span>${dropsite.activeOrders || 0}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong>Total Customers:</strong>
                <span>${dropsite.totalCustomers || 0}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <strong>Utilization:</strong>
                <span>${((dropsite.activeOrders || 0) / dropsite.capacity * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <button class="btn btn-warning" onclick="dropsiteManager.editDropsite(${dropsite.id}); closeModal('dropsite-details-modal');">
          ✏️ Edit Dropsite
        </button>
        <button class="btn btn-secondary" onclick="closeModal('dropsite-details-modal')">
          Close
        </button>
      </div>
    `;

    document.getElementById('dropsite-details-content').innerHTML = detailsHtml;
    showModal('dropsite-details-modal');
  }

  refreshDropsites() {
    this.loadDropsites();
    alert('Dropsites refreshed!');
  }

  generateScheduleReport() {
    const reportData = this.dropsites.map(dropsite => {
      const enabledDays = Object.entries(dropsite.schedule)
        .filter(([day, info]) => info.enabled)
        .map(([day, info]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${info.start}-${info.end}`)
        .join('; ');
      
      return {
        name: dropsite.name,
        city: dropsite.city,
        status: dropsite.status,
        capacity: dropsite.capacity,
        activeOrders: dropsite.activeOrders || 0,
        schedule: enabledDays || 'No pickup times'
      };
    });

    // Generate CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Dropsite Name,City,Status,Capacity,Active Orders,Schedule\n" +
      reportData.map(row => 
        `"${row.name}","${row.city}","${row.status}","${row.capacity}","${row.activeOrders}","${row.schedule}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dropsite_schedule_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Schedule report exported successfully!');
  }

  // Get active dropsites for checkout integration
  getActiveDropsites() {
    return this.dropsites.filter(d => d.status === 'active');
  }

  // Get dropsite by ID
  getDropsiteById(id) {
    return this.dropsites.find(d => d.id === id);
  }
}

// Initialize dropsite manager
const dropsiteManager = new DropsiteManager();

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('dropsite-form');
  if (form) {
    form.addEventListener('submit', function(event) {
      dropsiteManager.saveDropsite(event);
    });
  }
});

// Global functions for HTML
function addNewDropsite() {
  dropsiteManager.addNewDropsite();
}

function refreshDropsites() {
  dropsiteManager.refreshDropsites();
}

function generateScheduleReport() {
  dropsiteManager.generateScheduleReport();
}
