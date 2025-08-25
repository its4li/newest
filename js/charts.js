// Charts functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    // نمودار فعالیت روزانه
    initDailyActivityChart();
    
    // نمودار توزیع بلاک‌چین‌ها
    initBlockchainDistributionChart();
    
    // نمودار حجم تراکنش‌ها
    initTransactionVolumeChart();
}

function initDailyActivityChart() {
    const ctx = document.getElementById('dailyActivityChart');
    if (!ctx) return;
    
    const data = {
        labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
        datasets: [{
            label: 'تعداد تراکنش‌ها',
            data: [120, 190, 300, 500, 200, 300, 450],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: true
        }, {
            label: 'فعالیت‌های مشکوک',
            data: [2, 5, 8, 12, 3, 7, 9],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: {
                            family: 'Vazir'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function initBlockchainDistributionChart() {
    const ctx = document.getElementById('blockchainDistributionChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Bitcoin', 'Ethereum', 'Litecoin', 'Bitcoin Cash', 'Dogecoin'],
        datasets: [{
            data: [45, 30, 12, 8, 5],
            backgroundColor: [
                '#f7931a',
                '#627eea',
                '#bfbbbb',
                '#8dc351',
                '#c2a633'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        font: {
                            family: 'Vazir'
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function initTransactionVolumeChart() {
    const ctx = document.getElementById('transactionVolumeChart');
    if (!ctx) return;
    
    const data = {
        labels: ['هفته 1', 'هفته 2', 'هفته 3', 'هفته 4'],
        datasets: [{
            label: 'حجم تراکنش (میلیون دلار)',
            data: [12.5, 19.2, 15.8, 22.1],
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: '#3498db',
            borderWidth: 2
        }]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

// تابع به‌روزرسانی نمودارها
function updateCharts() {
    // به‌روزرسانی داده‌های نمودارها با اطلاعات جدید
    // این تابع می‌تواند از API فراخوانی شود
}

// نمودار تحلیل تراکنش‌ها
function initTransactionAnalysisChart() {
    const ctx = document.getElementById('transactionAnalysisChart');
    if (!ctx) return;
    
    const data = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
            label: 'تراکنش‌های عادی',
            data: [45, 23, 67, 89, 76, 54],
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            tension: 0.4
        }, {
            label: 'تراکنش‌های مشکوک',
            data: [2, 1, 5, 8, 6, 3],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
