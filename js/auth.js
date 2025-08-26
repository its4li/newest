// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication (در محیط واقعی باید از سرور احراز هویت شود)
            if (username && password) {
                // نمایش لودینگ
                showLoading();
                
                // شبیه‌سازی تأخیر شبکه
                setTimeout(() => {
                    if (authenticateUser(username, password)) {
                        // ذخیره اطلاعات کاربر
                        localStorage.setItem('currentUser', JSON.stringify({
                            username: username,
                            loginTime: new Date().toISOString(),
                            role: 'officer'
                        }));
                        
                        // انتقال به داشبورد
                        window.location.href = 'dashboard.html';
                    } else {
                        hideLoading();
                        showAlert('نام کاربری یا رمز عبور اشتباه است', 'error');
                    }
                }, 1500);
            } else {
                showAlert('لطفاً تمام فیلدها را پر کنید', 'warning');
            }
        });
    }
});

function authenticateUser(username, password) {
    // لیست کاربران مجاز (در محیط واقعی از پایگاه داده)
    const validUsers = [
        { username: 'admin', password: 'admin123' },
        { username: 'officer1', password: 'pass123' },
        { username: 'mohammadi', password: 'feta2024' },
        { username: 'ahmadi', password: 'police123' },
        { username: 'rezaei', password: 'cyber2024' }
    ];
    
    return validUsers.some(user => 
        user.username === username && user.password === password
    );
}

function fillCredentials(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    showAlert('اطلاعات ورود پر شد', 'success');
}

function showLoading() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ورود...';
    loginBtn.disabled = true;
}

function hideLoading() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ورود به داشبورد';
    loginBtn.disabled = false;
}

function showAlert(message, type) {
    // حذف هشدارهای قبلی
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        ${message}
    `;
    
    const loginCard = document.querySelector('.login-card');
    loginCard.insertBefore(alert, loginCard.firstChild);
    
    // حذف خودکار بعد از 5 ثانیه
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// بررسی وضعیت ورود در صفحه داشبورد
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// خروج از سیستم
function logout() {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
