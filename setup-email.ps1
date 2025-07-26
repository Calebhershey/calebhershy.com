# Grazin Acres Email Setup Script for Windows PowerShell

Write-Host "🌱 Setting up Email Notifications for Grazin Acres..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing email dependencies..." -ForegroundColor Yellow
npm install nodemailer dotenv

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "📝 Please edit .env file with your email credentials" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ .env file already exists" -ForegroundColor Yellow
}

# Create .gitignore if it doesn't exist or add .env to it
if (!(Test-Path ".gitignore")) {
    ".env" | Out-File -FilePath ".gitignore"
    Write-Host "✅ Created .gitignore file" -ForegroundColor Green
} else {
    $gitignoreContent = Get-Content ".gitignore"
    if ($gitignoreContent -notcontains ".env") {
        ".env" | Add-Content -Path ".gitignore"
        Write-Host "✅ Added .env to .gitignore" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Email setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your email credentials"
Write-Host "2. Start the server: npm start"
Write-Host "3. Test email: Invoke-RestMethod -Uri http://localhost:3000/admin/test-email -Method Post"
Write-Host ""
Write-Host "📖 See EMAIL_SETUP.md for detailed instructions" -ForegroundColor Cyan
