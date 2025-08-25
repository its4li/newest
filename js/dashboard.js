// Dashboard main functionality
document.addEventListener('DOMContentLoaded', function() {
    // بررسی احراز هویت
    checkAuth();
    
    // بارگذاری اطلاعات کاربر
    loadUserInfo();
    
    // راه‌اندازی navigation
    setupNavigation();
    
    // بارگذاری داده‌های اولیه
    loadDashboardData();
    
    // راه‌اندازی real-time updates
    setupRealTimeUpdates();
});

function loadUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('currentUser').textContent = currentUser.username;
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // حذف کلاس active از همه لینک‌ها
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // اضافه کردن کلاس active به لینک کلیک شده
            this.parentElement.classList.add('active');
            
            // مخفی کردن همه بخش‌ها
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // نمایش بخش مورد نظر
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                updatePageTitle(targetSection);
                loadSectionData(targetSection);
            }
        });
    });
}

function updatePageTitle(section) {
    const titles = {
        'overview': {
            title: 'نمای کلی سیستم',
            subtitle: 'آمار و اطلاعات کلی سیستم رهگیری'
        },
        'wallet-tracker': {
            title: 'ردیابی والت',
            subtitle: 'جستجو و رهگیری آدرس‌های بلاک‌چین'
        },
        'transaction-analysis': {
            title: 'تحلیل تراکنش‌ها',
            subtitle: 'بررسی و تحلیل الگوهای تراکنش'
        },
        'suspicious-activity': {
            title: 'فعالیت‌های مشکوک',
            subtitle: 'نظارت بر تراکنش‌های مشکوک'
        },
        'reports': {
            title: 'گزارش‌ها',
            subtitle: 'تولید و مدیریت گزارش‌ها'
        },
        'alerts': {
            title: 'هشدارها',
            subtitle: 'مدیریت هشدارهای سیستم'
        },
        'settings': {
            title: 'تنظیمات',
            subtitle: 'پیکربندی سیستم و کاربر'
        }
    };
    
    const pageInfo = titles[section];
    if (pageInfo) {
        document.getElementById('pageTitle').textContent = pageInfo.title;
        document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;
    }
}

function loadSectionData(section) {
    switch(section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'suspicious-activity':
            loadSuspiciousActivities();
            break;
        case 'alerts':
            loadAlerts();
            break;
        case 'transaction-analysis':
            loadTransactionAnalysis();
            break;
    }
}

function loadDashboardData() {
    loadOverviewData();
    loadRecentActivity();
}

function loadOverviewData() {
    // شبیه‌سازی بارگذاری داده‌ها
    const stats = {
        totalWallets: 1247,
        totalTransactions: 15892,
        suspiciousActivities: 23,
        resolvedCases: 156
    };
    
    // به‌روزرسانی آمار
    document.getElementById('totalWallets').textContent = stats.totalWallets.toLocaleString('fa-IR');
    document.getElementById('totalTransactions').textContent = stats.totalTransactions.toLocaleString('fa-IR');
    document.getElementById('suspiciousActivities').textContent = stats.suspiciousActivities.toLocaleString('fa-IR');
    document.getElementById('resolvedCases').textContent = stats.resolvedCases.toLocaleString('fa-IR');
}

function loadRecentActivity() {
    const activities = [
        {
            type: 'wallet-tracked',
            icon: 'fas fa-search',
            iconColor: '#3498db',
            title: 'والت جدید رهگیری شد',
            description: 'آدرس: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            time: '5 دقیقه پیش'
        },
        {
            type: 'suspicious-detected',
            icon: 'fas fa-exclamation-triangle',
            iconColor: '#e74c3c',
            title: 'فعالیت مشکوک شناسایی شد',
            description: 'تراکنش بالای 100,000 دلار',
            time: '12 دقیقه پیش'
        },
        {
            type: 'report-generated',
            icon: 'fas fa-file-alt',
            iconColor: '#27ae60',
            title: 'گزارش روزانه تولید شد',
            description: 'گزارش فعالیت‌های 24 ساعت گذشته',
            time: '1 ساعت پیش'
        },
        {
            type: 'alert-resolved',
            icon: 'fas fa-check-circle',
            iconColor: '#f39c12',
            title: 'هشدار حل شد',
            description: 'هشدار تراکنش مشکوک #1234',
            time: '2 ساعت پیش'
        }
    ];
    
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.iconColor}20; color: ${activity.iconColor}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-info">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

function loadSuspiciousActivities() {
    const suspiciousActivities = [
        {
            id: 'SA001',
            level: 'high',
            type: 'Large Transaction',
            description: 'تراکنش 250,000 دلاری در کمتر از 1 ساعت',
            wallet: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            amount: '$250,000',
            time: '2024-01-15 14:30',
            status: 'pending'
        },
        {
            id: 'SA002',
            level: 'medium',
            type: 'Multiple Transfers',
            description: 'انتقال به 15 والت مختلف در 30 دقیقه',
            wallet: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
            amount: '$45,000',
            time: '2024-01-15 13:15',
            status: 'investigating'
        },
        {
            id: 'SA003',
            level: 'high',
            type: 'Mixer Service',
            description: 'استفاده از سرویس میکسر برای مخفی کردن مسیر',
            wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: '$180,000',
            time: '2024-01-15 12:45',
            status: 'pending'
        }
    ];
    
    const suspiciousList = document.getElementById('suspiciousList');
    if (suspiciousList) {
        suspiciousList.innerHTML = suspiciousActivities.map(activity => `
            <div class="suspicious-item ${activity.level}">
                <div class="suspicious-header">
                    <div class="suspicious-id">${activity.id}</div>
                    <div class="suspicious-level ${activity.level}">
                        ${activity.level === 'high' ? 'خطر بالا' : 
                          activity.level === 'medium' ? 'خطر متوسط' : 'خطر پایین'}
                    </div>
                    <div class="suspicious-status ${activity.status}">
                        ${activity.status === 'pending' ? 'در انتظار' : 
                          activity.status === 'investigating' ? 'در حال بررسی' : 'حل شده'}
                    </div>
                </div>
                <div class="suspicious-content">
                    <h4>${activity.type}</h4>
                    <p>${activity.description}</p>
                    <div class="suspicious-details">
                        <span><strong>والت:</strong> ${activity.wallet}</span>
                        <span><strong>مبلغ:</strong> ${activity.amount}</span>
                        <span><strong>زمان:</strong> ${activity.time}</span>
                    </div>
                </div>
                <div class="suspicious-actions">
                    <button class="btn-investigate" onclick="investigateActivity('${activity.id}')">
                        <i class="fas fa-search"></i> بررسی
                    </button>
                    <button class="btn-resolve" onclick="resolveActivity('${activity.id}')">
                        <i class="fas fa-check"></i> حل شده
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function loadAlerts() {
    const alerts = [
        {
            id: 'AL001',
            type: 'high-value',
            title: 'تراکنش با ارزش بالا',
            message: 'تراکنش 500,000 دلاری شناسایی شد',
            time: '10 دقیقه پیش',
            read: false
        },
        {
            id: 'AL002',
            type: 'suspicious-pattern',
            title: 'الگوی مشکوک',
            message: 'الگوی تراکنش مشابه پولشویی شناسایی شد',
            time: '25 دقیقه پیش',
            read: false
        },
        {
            id: 'AL003',
            type: 'system',
            title: 'به‌روزرسانی سیستم',
            message: 'سیستم با موفقیت به‌روزرسانی شد',
            time: '1 ساعت پیش',
            read: true
        }
    ];
    
    const alertsList = document.getElementById('alertsList');
    if (alertsList) {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.read ? 'read' : 'unread'}">
                <div class="alert-icon ${alert.type}">
                    <i class="fas fa-${getAlertTypeIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <span class="alert-time">${alert.time}</span>
                </div>
                <div class="alert-actions">
                    ${!alert.read ? '<button class="mark-read-btn" onclick="markAsRead(\'' + alert.id + '\')"><i class="fas fa-check"></i></button>' : ''}
                    <button class="delete-alert-btn" onclick="deleteAlert('${alert.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
}

function getAlertTypeIcon(type) {
    const icons = {
        'high-value': 'dollar-sign',
        'suspicious-pattern': 'exclamation-triangle',
        'system': 'cog'
    };
    return icons[type] || 'bell';
}

function setupRealTimeUpdates() {
    // شبیه‌سازی به‌روزرسانی real-time
    setInterval(() => {
        updateNotificationCount();
        // به‌روزرسانی سایر داده‌ها
    }, 30000); // هر 30 ثانیه
}

function updateNotificationCount() {
    const count = Math.floor(Math.random() * 5) + 1;
    document.querySelector('.notification-count').textContent = count;
}

// توابع عملیاتی
function investigateActivity(activityId) {
    showAlert(`شروع بررسی فعالیت ${activityId}`, 'info');
}

function resolveActivity(activityId) {
    if (confirm('آیا مطمئن هستید که این فعالیت حل شده است؟')) {
        showAlert(`فعالیت ${activityId} به عنوان حل شده علامت‌گذاری شد`, 'success');
        loadSuspiciousActivities(); // بارگذاری مجدد لیست
    }
}

function markAsRead(alertId) {
    showAlert('هشدار به عنوان خوانده شده علامت‌گذاری شد', 'success');
    loadAlerts(); // بارگذاری مجدد هشدارها
}

function deleteAlert(alertId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این هشدار را حذف کنید؟')) {
        showAlert('هشدار حذف شد', 'success');
        loadAlerts(); // بارگذاری مجدد هشدارها
    }
}

function generateReport() {
    showAlert('گزارش در حال تولید است...', 'info');
    
    setTimeout(() => {
        showAlert('گزارش با موفقیت تولید شد', 'success');
    }, 2000);
}

// تابع نمایش پیام
function showAlert(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert ${type}`;
    alertContainer.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        ${message}
    `;
    
    document.body.appendChild(alertContainer);
    
    // موقعیت‌دهی
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.left = '20px';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.minWidth = '300px';
    
    // حذف خودکار
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}
