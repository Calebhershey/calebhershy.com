# Grazin Acres PHP Server

This is the PHP version of the Grazin Acres server, converted from Node.js/Express.

## Requirements

- PHP 7.4 or higher
- Web server (Apache/Nginx) with rewrite module enabled
- Write permissions for the `data/` directory

## Setup

1. **For Apache with mod_rewrite:**
   - Make sure the `.htaccess` file is in the same directory as `server.php`
   - Ensure your Apache configuration allows `.htaccess` files and has `mod_rewrite` enabled

2. **For development with PHP built-in server:**
   ```bash
   php -S localhost:3000 router.php
   ```

3. **For Nginx:**
   Add this to your Nginx configuration:
   ```nginx
   location ~ ^/(signup|login|profile|order|orders|debug|admin) {
       try_files $uri $uri/ /server.php?$args;
   }
   ```

## Features

All the original Node.js functionality has been preserved:

- **User Management:**
  - User signup with comprehensive profile data
  - User login with authentication
  - Profile management (get/update)
  - Digital signature and agreement acceptance

- **Order Management:**
  - Order creation and storage
  - Order status tracking
  - Order history

- **Admin Features:**
  - User management (view/delete users)
  - Order management (view/update status)
  - Analytics dashboard
  - Recent activity tracking

- **Data Storage:**
  - Uses JSON files for data persistence (`data/users.json` and `data/orders.json`)
  - Automatic data directory creation
  - File-based storage (easily replaceable with database)

## API Endpoints

All endpoints remain the same as the original Node.js version:

- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /profile/{id}` - Get user profile
- `PUT /profile/{id}` - Update user profile
- `POST /order` - Create order
- `GET /orders` - Get all orders
- `GET /debug/users` - Debug endpoint for users
- `GET /admin/users` - Admin: Get all users
- `GET /admin/orders` - Admin: Get all orders
- `DELETE /admin/users/{id}` - Admin: Delete user
- `PUT /admin/orders/{index}/status` - Admin: Update order status
- `GET /admin/analytics` - Admin: Get analytics
- `GET /admin/recent-activity` - Admin: Get recent activity

## Changes from Node.js Version

1. **Data Storage:** Uses JSON files instead of in-memory arrays
2. **Routing:** Uses URL parsing and pattern matching instead of Express routes
3. **CORS:** Handled with PHP headers instead of cors middleware
4. **Authentication:** Same logic, adapted for PHP
5. **Error Handling:** Uses PHP's built-in error handling

## Security Notes

- The admin authentication is currently disabled for development
- In production, implement proper JWT or session-based authentication
- Use HTTPS in production
- Consider using a proper database instead of JSON files
- Validate and sanitize all input data
- Implement rate limiting
