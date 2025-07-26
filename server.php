<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Auth");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple data storage (use a database for real apps)
class DataStore {
    private static $usersFile = 'data/users.json';
    private static $ordersFile = 'data/orders.json';
    
    public static function init() {
        if (!file_exists('data')) {
            mkdir('data', 0777, true);
        }
        if (!file_exists(self::$usersFile)) {
            file_put_contents(self::$usersFile, json_encode([]));
        }
        if (!file_exists(self::$ordersFile)) {
            file_put_contents(self::$ordersFile, json_encode([]));
        }
    }
    
    public static function getUsers() {
        return json_decode(file_get_contents(self::$usersFile), true) ?: [];
    }
    
    public static function saveUsers($users) {
        file_put_contents(self::$usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }
    
    public static function getOrders() {
        return json_decode(file_get_contents(self::$ordersFile), true) ?: [];
    }
    
    public static function saveOrders($orders) {
        file_put_contents(self::$ordersFile, json_encode($orders, JSON_PRETTY_PRINT));
    }
}

// Initialize data storage
DataStore::init();

// Simple admin authentication middleware
function adminAuth() {
    // In production, implement proper JWT or session-based auth
    $adminHeader = $_SERVER['HTTP_X_ADMIN_AUTH'] ?? '';
    if ($adminHeader === 'admin-authenticated') {
        return true;
    } else {
        // For now, we'll skip authentication in development
        return true; // Remove this in production and uncomment below
        // return false;
    }
}

// Helper function to send JSON response
function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Helper function to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// Route handling
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUri = parse_url($requestUri);
$path = $parsedUri['path'];

// Remove any query parameters and normalize path
$path = rtrim($path, '/');
if (empty($path)) $path = '/';

switch ($requestMethod) {
    case 'POST':
        if ($path === '/signup') {
            handleSignup();
        } elseif ($path === '/login') {
            handleLogin();
        } elseif ($path === '/order') {
            handleOrder();
        } else {
            sendJson(['message' => 'Not found'], 404);
        }
        break;
        
    case 'GET':
        if (preg_match('/^\/profile\/(\d+)$/', $path, $matches)) {
            handleGetProfile($matches[1]);
        } elseif ($path === '/orders') {
            handleGetOrders();
        } elseif ($path === '/debug/users') {
            handleDebugUsers();
        } elseif ($path === '/admin/users') {
            handleAdminGetUsers();
        } elseif ($path === '/admin/orders') {
            handleAdminGetOrders();
        } elseif ($path === '/admin/analytics') {
            handleAdminAnalytics();
        } elseif ($path === '/admin/recent-activity') {
            handleAdminRecentActivity();
        } else {
            sendJson(['message' => 'Not found'], 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/^\/profile\/(\d+)$/', $path, $matches)) {
            handleUpdateProfile($matches[1]);
        } elseif (preg_match('/^\/admin\/orders\/(\d+)\/status$/', $path, $matches)) {
            handleUpdateOrderStatus($matches[1]);
        } else {
            sendJson(['message' => 'Not found'], 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/^\/admin\/users\/(\d+)$/', $path, $matches)) {
            handleDeleteUser($matches[1]);
        } else {
            sendJson(['message' => 'Not found'], 404);
        }
        break;
        
    default:
        sendJson(['message' => 'Method not allowed'], 405);
}

function handleSignup() {
    $input = getJsonInput();
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $profile = $input['profile'] ?? [];
    
    $users = DataStore::getUsers();
    
    // Check if username already exists
    foreach ($users as $user) {
        if ($user['username'] === $username) {
            sendJson(['message' => 'Username already exists'], 400);
        }
    }
    
    // Validate required fields for enhanced signup
    if (empty($profile['email']) || empty($profile['firstName']) || empty($profile['lastName'])) {
        sendJson(['message' => 'Missing required profile information'], 400);
    }
    
    // Check if signature is provided
    if (empty($profile['signature'])) {
        sendJson(['message' => 'Digital signature is required'], 400);
    }
    
    // Check if user agreed to terms
    if (empty($profile['agreementAccepted'])) {
        sendJson(['message' => 'You must accept the membership agreement'], 400);
    }
    
    // Create user with comprehensive profile data
    $newUser = [
        'id' => time() * 1000 + random_int(0, 999), // Simple ID generation (use UUID in production)
        'username' => $username,
        'password' => $password,
        'profile' => [
            'username' => $username,
            'email' => $profile['email'],
            'fullName' => $profile['fullName'] ?? ($profile['firstName'] . ' ' . $profile['lastName']),
            'firstName' => $profile['firstName'],
            'lastName' => $profile['lastName'],
            'phone' => $profile['phone'] ?? '',
            'birthdate' => $profile['birthdate'] ?? '',
            'address' => $profile['address'] ?? '',
            'city' => $profile['city'] ?? '',
            'zipcode' => $profile['zipcode'] ?? '',
            'memberType' => $profile['memberType'] ?? 'individual',
            'interests' => $profile['interests'] ?? '',
            'newsletterConsent' => $profile['newsletterConsent'] ?? false,
            'signature' => $profile['signature'],
            'agreementAccepted' => $profile['agreementAccepted'],
            'agreementDate' => $profile['agreementDate'] ?? date('c'),
            'ageVerified' => $profile['ageVerified'] ?? false,
            'bio' => $profile['bio'] ?? '',
            'avatarUrl' => $profile['avatarUrl'] ?? '',
            'location' => trim(($profile['city'] ?? '') . ', ' . ($profile['zipcode'] ?? ''), ', '),
            'farmerType' => $profile['farmerType'] ?? ($profile['memberType'] === 'farmer' ? 'farmer' : 'buyer'),
            'membershipStatus' => 'active',
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ]
    ];
    
    $users[] = $newUser;
    DataStore::saveUsers($users);
    
    error_log('New member created: ' . $newUser['id'] . ' ' . $newUser['username'] . ' Type: ' . $newUser['profile']['memberType']);
    
    sendJson([
        'message' => 'Membership created successfully! Welcome to Grazin Acres.',
        'userId' => $newUser['id'],
        'profile' => $newUser['profile']
    ]);
}

function handleLogin() {
    $input = getJsonInput();
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    $users = DataStore::getUsers();
    $user = null;
    
    foreach ($users as $u) {
        if ($u['username'] === $username && $u['password'] === $password) {
            $user = $u;
            break;
        }
    }
    
    if ($user) {
        // Check if user has signed the agreement (for existing users)
        if (empty($user['profile']['agreementAccepted'])) {
            sendJson([
                'message' => 'Please complete your membership agreement to access the site.',
                'requiresAgreement' => true
            ], 403);
        }
        
        // Generate a simple token (in production, use proper JWT)
        $token = 'auth_' . $user['id'] . '_' . time();
        
        error_log('Login successful for member: ' . $user['id'] . ' ' . $user['username'] . ' Type: ' . $user['profile']['memberType']);
        
        sendJson([
            'message' => 'Welcome back, ' . ($user['profile']['firstName'] ?? $user['username']) . '!',
            'userId' => $user['id'],
            'profile' => $user['profile'],
            'token' => $token
        ]);
    } else {
        sendJson(['message' => 'Invalid credentials. Please check your username and password.'], 401);
    }
}

function handleGetProfile($userId) {
    $users = DataStore::getUsers();
    
    foreach ($users as $user) {
        if ($user['id'] == $userId) {
            sendJson($user['profile']);
        }
    }
    
    sendJson(['message' => 'User not found'], 404);
}

function handleUpdateProfile($userId) {
    $input = getJsonInput();
    $users = DataStore::getUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['id'] == $userId) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        sendJson(['message' => 'User not found'], 404);
    }
    
    // Update profile fields
    $allowedFields = ['bio', 'avatarUrl', 'fullName', 'email', 'phone', 'location', 'farmerType'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $users[$userIndex]['profile'][$field] = $input[$field];
        }
    }
    
    $users[$userIndex]['profile']['updatedAt'] = date('c');
    DataStore::saveUsers($users);
    
    sendJson([
        'message' => 'Profile updated successfully',
        'profile' => $users[$userIndex]['profile']
    ]);
}

function handleOrder() {
    $input = getJsonInput();
    error_log('Order received: ' . json_encode($input));
    
    // Enhanced order structure
    $order = array_merge($input, [
        'id' => time() * 1000 + random_int(0, 999), // Simple ID generation
        'status' => 'pending',
        'createdAt' => date('c'),
        'updatedAt' => date('c')
    ]);
    
    $orders = DataStore::getOrders();
    $orders[] = $order;
    DataStore::saveOrders($orders);
    
    sendJson([
        'message' => 'Order received',
        'orderId' => $order['id'],
        'status' => $order['status']
    ]);
}

function handleGetOrders() {
    $orders = DataStore::getOrders();
    sendJson($orders);
}

function handleDebugUsers() {
    $users = DataStore::getUsers();
    $debugUsers = array_map(function($u) {
        return [
            'id' => $u['id'],
            'username' => $u['username'],
            'profile' => $u['profile']
        ];
    }, $users);
    
    sendJson($debugUsers);
}

function handleAdminGetUsers() {
    // In production, add admin authentication middleware here
    $users = DataStore::getUsers();
    $userList = array_map(function($u) {
        return [
            'id' => $u['id'],
            'username' => $u['username'],
            'profile' => $u['profile']
        ];
    }, $users);
    
    sendJson($userList);
}

function handleAdminGetOrders() {
    // In production, add admin authentication middleware here
    $orders = DataStore::getOrders();
    $ordersWithIds = array_map(function($order, $index) {
        return array_merge($order, [
            'id' => $order['id'] ?? ($index + 1),
            'status' => $order['status'] ?? 'pending',
            'createdAt' => $order['createdAt'] ?? date('c')
        ]);
    }, $orders, array_keys($orders));
    
    sendJson($ordersWithIds);
}

function handleDeleteUser($userId) {
    // In production, add admin authentication middleware here
    $users = DataStore::getUsers();
    $userIndex = -1;
    
    foreach ($users as $index => $user) {
        if ($user['id'] == $userId) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        sendJson(['message' => 'User not found'], 404);
    }
    
    array_splice($users, $userIndex, 1);
    DataStore::saveUsers($users);
    
    sendJson(['message' => 'User deleted successfully']);
}

function handleUpdateOrderStatus($orderIndex) {
    // In production, add admin authentication middleware here
    $input = getJsonInput();
    $status = $input['status'] ?? '';
    $orders = DataStore::getOrders();
    
    if ($orderIndex < 0 || $orderIndex >= count($orders)) {
        sendJson(['message' => 'Order not found'], 404);
    }
    
    if (!in_array($status, ['pending', 'processing', 'completed', 'cancelled'])) {
        sendJson(['message' => 'Invalid status'], 400);
    }
    
    $orders[$orderIndex]['status'] = $status;
    $orders[$orderIndex]['updatedAt'] = date('c');
    DataStore::saveOrders($orders);
    
    sendJson([
        'message' => 'Order status updated successfully',
        'order' => $orders[$orderIndex]
    ]);
}

function handleAdminAnalytics() {
    // In production, add admin authentication middleware here
    $users = DataStore::getUsers();
    $orders = DataStore::getOrders();
    
    $totalUsers = count($users);
    $totalOrders = count($orders);
    $buyers = count(array_filter($users, function($u) {
        return ($u['profile']['farmerType'] ?? '') === 'buyer';
    }));
    $sellers = count(array_filter($users, function($u) {
        $type = $u['profile']['farmerType'] ?? '';
        return $type === 'seller' || $type === 'both';
    }));
    
    $totalRevenue = array_reduce($orders, function($sum, $order) {
        return $sum + ($order['total'] ?? $order['grandTotal'] ?? 0);
    }, 0);
    $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
    
    $today = date('Y-m-d');
    $ordersToday = count(array_filter($orders, function($order) use ($today) {
        if (!isset($order['date'])) return false;
        return date('Y-m-d', strtotime($order['date'])) === $today;
    }));
    
    $analytics = [
        'totalUsers' => $totalUsers,
        'totalOrders' => $totalOrders,
        'buyers' => $buyers,
        'sellers' => $sellers,
        'totalRevenue' => $totalRevenue,
        'avgOrderValue' => $avgOrderValue,
        'ordersToday' => $ordersToday,
        'pendingOrders' => count(array_filter($orders, function($o) {
            return ($o['status'] ?? 'pending') === 'pending';
        }))
    ];
    
    sendJson($analytics);
}

function handleAdminRecentActivity() {
    $users = DataStore::getUsers();
    $orders = DataStore::getOrders();
    
    $recentOrders = array_slice(array_reverse($orders), 0, 10); // Last 10 orders
    $recentUsers = array_slice(array_reverse($users), 0, 5); // Last 5 users
    
    $activity = [
        'recentOrders' => array_map(function($order) {
            return [
                'id' => $order['id'],
                'customer' => $order['customer'] ?? $order['name'] ?? '',
                'total' => $order['total'] ?? $order['grandTotal'] ?? 0,
                'date' => $order['createdAt'] ?? $order['date'] ?? '',
                'status' => $order['status'] ?? 'pending'
            ];
        }, $recentOrders),
        'recentUsers' => array_map(function($user) {
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'joinDate' => $user['profile']['createdAt'] ?? '',
                'type' => $user['profile']['farmerType'] ?? ''
            ];
        }, $recentUsers)
    ];
    
    sendJson($activity);
}
?>
