// CryptoAPIs configuration
const CRYPTO_APIS_CONFIG = {
    baseUrl: 'https://rest.cryptoapis.io/v2',
    apiKey: 'e96e3116cdffb71f089cabd58a191e10eec7811c', // باید از تنظیمات گرفته شود
    endpoints: {
        bitcoin: '/blockchain-data/bitcoin/mainnet',
        ethereum: '/blockchain-data/ethereum/mainnet',
        litecoin: '/blockchain-data/litecoin/mainnet',
        'bitcoin-cash': '/blockchain-data/bitcoin-cash/mainnet',
        dogecoin: '/blockchain-data/dogecoin/mainnet'
    }
};

async function trackWallet() {
    const blockchain = document.getElementById('blockchainSelect').value;
    const address = document.getElementById('walletAddress').value.trim();
    const resultsContainer = document.getElementById('trackerResults');
    
    if (!address) {
        showAlert('لطفاً آدرس والت را وارد کنید', 'warning');
        return;
    }
    
    if (!validateAddress(address, blockchain)) {
        showAlert('آدرس والت معتبر نیست', 'error');
        return;
    }
    
    // نمایش لودینگ
    showLoading(resultsContainer);
    
    try {
        // دریافت اطلاعات والت
        const walletInfo = await getWalletInfo(blockchain, address);
        
        // دریافت تراکنش‌ها
        const transactions = await getWalletTransactions(blockchain, address);
        
        // نمایش نتایج
        displayWalletResults(walletInfo, transactions, address, blockchain);
        
        // ذخیره در تاریخچه
        saveToHistory(address, blockchain);
        
    } catch (error) {
        console.error('Error tracking wallet:', error);
        showError(resultsContainer, 'خطا در دریافت اطلاعات والت');
    }
}

function validateAddress(address, blockchain) {
    const patterns = {
        bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
        ethereum: /^0x[a-fA-F0-9]{40}$/,
        litecoin: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
        'bitcoin-cash': /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^q[a-z0-9]{41}$/,
        dogecoin: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/
    };
    
    return patterns[blockchain] ? patterns[blockchain].test(address) : true;
}

async function getWalletInfo(blockchain, address) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API Key not configured');
    }
    
    const endpoint = `${CRYPTO_APIS_CONFIG.baseUrl}${CRYPTO_APIS_CONFIG.endpoints[blockchain]}/addresses/${address}`;
    
    const response = await fetch(endpoint, {
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.item;
}

async function getWalletTransactions(blockchain, address, limit = 50) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API Key not configured');
    }
    
    const endpoint = `${CRYPTO_APIS_CONFIG.baseUrl}${CRYPTO_APIS_CONFIG.endpoints[blockchain]}/addresses/${address}/transactions?limit=${limit}`;
    
    const response = await fetch(endpoint, {
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.items;
}

function displayWalletResults(walletInfo, transactions, address, blockchain) {
    const resultsContainer = document.getElementById('trackerResults');
    
    const html = `
        <div class="wallet-results">
            <div class="wallet-header">
                <h3>نتایج ردیابی والت</h3>
                <div class="wallet-actions">
                    <button class="btn-export" onclick="exportWalletData('${address}')">
                        <i class="fas fa-download"></i> صادرات
                    </button>
                    <button class="btn-monitor" onclick="addToMonitoring('${address}', '${blockchain}')">
                        <i class="fas fa-eye"></i> نظارت مداوم
                    </button>
                </div>
            </div>
            
            <div class="wallet-address">
                <strong>آدرس:</strong> 
                <span class="address-text">${address}</span>
                <button class="copy-btn" onclick="copyToClipboard('${address}')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            
            <div class="wallet-info-grid">
                <div class="info-card">
                    <h4>موجودی کل</h4>
                    <p>${formatBalance(walletInfo.confirmedBalance, blockchain)}</p>
                </div>
                <div class="info-card">
                    <h4>تعداد تراکنش‌ها</h4>
                    <p>${walletInfo.transactionsCount?.toLocaleString('fa-IR') || 'نامشخص'}</p>
                </div>
                <div class="info-card">
                    <h4>اولین فعالیت</h4>
                    <p>${formatDate(walletInfo.firstSeenReceivingTransactionTime)}</p>
                </div>
                <div class="info-card">
                    <h4>آخرین فعالیت</h4>
                    <p>${formatDate(walletInfo.lastSeenReceivingTransactionTime)}</p>
                </div>
            </div>
            
            <div class="risk-assessment">
                <h4>ارزیابی ریسک</h4>
                <div class="risk-score ${getRiskLevel(walletInfo)}">
                    <span class="risk-label">${getRiskLabel(walletInfo)}</span>
                    <span class="risk-percentage">${calculateRiskScore(walletInfo)}%</span>
                </div>
                <div class="risk-factors">
                    ${generateRiskFactors(walletInfo, transactions)}
                </div>
            </div>
            
            <div class="transactions-section">
                <div class="transactions-header">
                    <h4>تراکنش‌های اخیر</h4>
                    <div class="transaction-filters">
                        <button class="filter-btn active" onclick="filterTransactions('all')">همه</button>
                        <button class="filter-btn" onclick="filterTransactions('incoming')">دریافتی</button>
                        <button class="filter-btn" onclick="filterTransactions('outgoing')">ارسالی</button>
                        <button class="filter-btn" onclick="filterTransactions('large')">مبالغ بالا</button>
                    </div>
                </div>
                
                <div class="transactions-table-container">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>هش تراکنش</th>
                                <th>نوع</th>
                                <th>مبلغ</th>
                                <th>تاریخ</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTransactionsTable(transactions, address, blockchain)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="wallet-graph">
                <h4>نمودار فعالیت والت</h4>
                <canvas id="walletActivityChart"></canvas>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    
    // رسم نمودار فعالیت
    drawWalletActivityChart(transactions);
}

function formatBalance(balance, blockchain) {
    if (!balance) return '0';
    
    const units = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        litecoin: 'LTC',
        'bitcoin-cash': 'BCH',
        dogecoin: 'DOGE'
    };
    
    const formattedBalance = (parseFloat(balance) / 100000000).toFixed(8);
    return `${formattedBalance} ${units[blockchain]}`;
}

function formatDate(timestamp) {
    if (!timestamp) return 'نامشخص';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR');
}

function getRiskLevel(walletInfo) {
    const score = calculateRiskScore(walletInfo);
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

function getRiskLabel(walletInfo) {
    const level = getRiskLevel(walletInfo);
    const labels = {
        high: 'ریسک بالا',
        medium: 'ریسک متوسط',
        low: 'ریسک پایین'
    };
    return labels[level];
}

function calculateRiskScore(walletInfo) {
    let score = 0;
    
    // فاکتورهای ریسک
    if (walletInfo.confirmedBalance > 1000000000) score += 30; // موجودی بالا
    if (walletInfo.transactionsCount > 1000) score += 20; // تعداد تراکنش بالا
    
    // محدود کردن امتیاز به 100
    return Math.min(score, 100);
}

function generateRiskFactors(walletInfo, transactions) {
    const factors = [];
    
    if (walletInfo.confirmedBalance > 1000000000) {
        factors.push('<span class="risk-factor high">موجودی بالا</span>');
    }
    
    if (walletInfo.transactionsCount > 1000) {
        factors.push('<span class="risk-factor medium">تعداد تراکنش بالا</span>');
    }
    
    if (factors.length === 0) {
        factors.push('<span class="risk-factor low">فعالیت عادی</span>');
    }
    
    return factors.join(' ');
}

function generateTransactionsTable(transactions, address, blockchain) {
    if (!transactions || transactions.length === 0) {
        return '<tr><td colspan="6" class="no-transactions">تراکنشی یافت نشد</td></tr>';
    }
    
    return transactions.map(tx => {
        const isIncoming = isIncomingTransaction(tx, address);
        const amount = getTransactionAmount(tx, address, isIncoming);
        
        return `
            <tr class="transaction-row" data-type="${isIncoming ? 'incoming' : 'outgoing'}">
                <td class="tx-hash" onclick="showTransactionDetails('${tx.transactionId}', '${blockchain}')">
                    ${tx.transactionId.substring(0, 16)}...
                </td>
                <td>
                    <span class="tx-type ${isIncoming ? 'incoming' : 'outgoing'}">
                        <i class="fas fa-arrow-${isIncoming ? 'down' : 'up'}"></i>
                        ${isIncoming ? 'دریافت' : 'ارسال'}
                    </span>
                </td>
                <td class="tx-amount ${isIncoming ? 'positive' : 'negative'}">
                    ${formatBalance(amount, blockchain)}
                </td>
                <td>${formatDate(tx.timestamp)}</td>
                <td>
                    <span class="tx-status confirmed">تأیید شده</span>
                </td>
                <td>
                    <button class="btn-analyze" onclick="analyzeTransaction('${tx.transactionId}', '${blockchain}')">
                        <i class="fas fa-search"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function isIncomingTransaction(tx, address) {
    // بررسی اینکه آیا تراکنش ورودی است یا خروجی
    return tx.recipients && tx.recipients.some(recipient => recipient.address === address);
}

function getTransactionAmount(tx, address, isIncoming) {
    if (isIncoming) {
        const recipient = tx.recipients.find(r => r.address === address);
        return recipient ? recipient.amount : 0;
    } else {
        return tx.fee || 0;
    }
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>در حال دریافت اطلاعات...</p>
        </div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>خطا در دریافت اطلاعات</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="trackWallet()">تلاش مجدد</button>
        </div>
    `;
}

function getApiKey() {
    // دریافت API Key از تنظیمات
    return localStorage.getItem('cryptoapis_key') || CRYPTO_APIS_CONFIG.apiKey;
}

function saveToHistory(address, blockchain) {
    const history = JSON.parse(localStorage.getItem('wallet_history') || '[]');
    const entry = {
        address,
        blockchain,
        timestamp: Date.now()
    };
    
    // حذف ورودی‌های تکراری
    const filteredHistory = history.filter(h => h.address !== address);
    filteredHistory.unshift(entry);
    
    // نگهداری حداکثر 50 ورودی
    const limitedHistory = filteredHistory.slice(0, 50);
    
    localStorage.setItem('wallet_history', JSON.stringify(limitedHistory));
}

// توابع کمکی
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('آدرس کپی شد', 'success');
    });
}

function exportWalletData(address) {
    showAlert('صادرات داده‌ها شروع شد...', 'info');
    // پیاده‌سازی صادرات
}

function addToMonitoring(address, blockchain) {
    showAlert('والت به لیست نظارت اضافه شد', 'success');
    // پیاده‌سازی نظارت مداوم
}

function filterTransactions(type) {
    const rows = document.querySelectorAll('.transaction-row');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // به‌روزرسانی دکمه‌ها
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // فیلتر کردن ردیف‌ها
    rows.forEach(row => {
        const rowType = row.getAttribute('data-type');
        const amount = parseFloat(row.querySelector('.tx-amount').textContent);
        
        let show = false;
        
        switch(type) {
            case 'all':
                show = true;
                break;
            case 'incoming':
                show = rowType === 'incoming';
                break;
            case 'outgoing':
                show = rowType === 'outgoing';
                break;
            case 'large':
                show = amount > 1; // مبالغ بالای 1 واحد
                break;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function showTransactionDetails(txId, blockchain) {
    // نمایش جزئیات تراکنش در modal
    showAlert(`نمایش جزئیات تراکنش ${txId.substring(0, 16)}...`, 'info');
}

function analyzeTransaction(txId, blockchain) {
    // تحلیل تراکنش
    showAlert(`شروع تحلیل تراکنش ${txId.substring(0, 16)}...`, 'info');
}

function drawWalletActivityChart(transactions) {
    const ctx = document.getElementById('walletActivityChart');
    if (!ctx) return;
    
    // پردازش داده‌ها برای نمودار
    const dailyActivity = processDailyActivity(transactions);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyActivity.labels,
            datasets: [{
                label: 'تعداد تراکنش‌ها',
                data: dailyActivity.data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
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

function processDailyActivity(transactions) {
    // پردازش تراکنش‌ها برای نمودار فعالیت روزانه
    const dailyCount = {};
    
    transactions.forEach(tx => {
        const date = new Date(tx.timestamp * 1000).toLocaleDateString('fa-IR');
        dailyCount[date] = (dailyCount[date] || 0) + 1;
    });
    
    const labels = Object.keys(dailyCount).slice(-7); // 7 روز اخیر
    const data = labels.map(label => dailyCount[label] || 0);
    
    return { labels, data };
}
