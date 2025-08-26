// CryptoAPIs configuration
const CRYPTO_APIS_CONFIG = {
    baseUrl: 'https://rest.cryptoapis.io/v2',
    apiKey: '', // از تنظیمات گرفته می‌شود
    endpoints: {
        bitcoin: '/blockchain-data/bitcoin/mainnet',
        ethereum: '/blockchain-data/ethereum/mainnet',
        litecoin: '/blockchain-data/litecoin/mainnet',
        'bitcoin-cash': '/blockchain-data/bitcoin-cash/mainnet',
        dogecoin: '/blockchain-data/dogecoin/mainnet'
    }
};

// Global variables
let currentWalletData = null;
let currentTransactions = [];

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
    
    const apiKey = getApiKey();
    if (!apiKey) {
        showAlert('لطفاً ابتدا کلید API را در تنظیمات وارد کنید', 'error');
        return;
    }
    
    // نمایش لودینگ
    showLoading(resultsContainer);
    
    try {
        // دریافت اطلاعات والت
        const walletInfo = await getWalletInfo(blockchain, address);
        
        // دریافت تراکنش‌ها
        const transactions = await getWalletTransactions(blockchain, address);
        
        // ذخیره داده‌ها
        currentWalletData = walletInfo;
        currentTransactions = transactions;
        
        // نمایش نتایج
        displayWalletResults(walletInfo, transactions, address, blockchain);
        
        // ذخیره در تاریخچه
        saveToHistory(address, blockchain);
        
        showAlert('اطلاعات والت با موفقیت دریافت شد', 'success');
        
    } catch (error) {
        console.error('Error tracking wallet:', error);
        showError(resultsContainer, error.message || 'خطا در دریافت اطلاعات والت');
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
    const endpoint = `${CRYPTO_APIS_CONFIG.baseUrl}${CRYPTO_APIS_CONFIG.endpoints[blockchain]}/addresses/${address}`;
    
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.item;
}

async function getWalletTransactions(blockchain, address, limit = 50, offset = 0) {
    const apiKey = getApiKey();
    const endpoint = `${CRYPTO_APIS_CONFIG.baseUrl}${CRYPTO_APIS_CONFIG.endpoints[blockchain]}/addresses/${address}/transactions?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.items || [];
}

async function getTransactionDetails(blockchain, txHash) {
    const apiKey = getApiKey();
    const endpoint = `${CRYPTO_APIS_CONFIG.baseUrl}${CRYPTO_APIS_CONFIG.endpoints[blockchain]}/transactions/${txHash}`;
    
    const response = await fetch(endpoint, {
        method: 'GET',
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
                    <button class="btn-refresh" onclick="refreshWalletData('${address}', '${blockchain}')">
                        <i class="fas fa-sync-alt"></i> به‌روزرسانی
                    </button>
                </div>
            </div>
            
            <div class="wallet-address-section">
                <div class="wallet-address">
                    <strong>آدرس:</strong> 
                    <span class="address-text">${address}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${address}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="blockchain-info">
                    <span class="blockchain-badge ${blockchain}">${getBlockchainName(blockchain)}</span>
                </div>
            </div>
            
            <div class="wallet-info-grid">
                <div class="info-card balance">
                    <div class="info-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="info-content">
                        <h4>موجودی کل</h4>
                        <p class="balance-amount">${formatBalance(walletInfo.confirmedBalance, blockchain)}</p>
                        <span class="balance-usd">${formatUSDValue(walletInfo.confirmedBalance, blockchain)}</span>
                    </div>
                </div>
                <div class="info-card transactions">
                    <div class="info-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="info-content">
                        <h4>تعداد تراکنش‌ها</h4>
                        <p>${walletInfo.transactionsCount?.toLocaleString('fa-IR') || 'نامشخص'}</p>
                    </div>
                </div>
                <div class="info-card first-seen">
                    <div class="info-icon">
                        <i class="fas fa-calendar-plus"></i>
                    </div>
                    <div class="info-content">
                        <h4>اولین فعالیت</h4>
                        <p>${formatDate(walletInfo.firstSeenReceivingTransactionTime)}</p>
                    </div>
                </div>
                <div class="info-card last-seen">
                    <div class="info-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="info-content">
                        <h4>آخرین فعالیت</h4>
                        <p>${formatDate(walletInfo.lastSeenReceivingTransactionTime)}</p>
                    </div>
                </div>
            </div>
            
            <div class="risk-assessment">
                <h4><i class="fas fa-shield-alt"></i> ارزیابی ریسک</h4>
                <div class="risk-container">
                    <div class="risk-score ${getRiskLevel(walletInfo)}">
                        <div class="risk-circle">
                            <span class="risk-percentage">${calculateRiskScore(walletInfo)}%</span>
                        </div>
                        <span class="risk-label">${getRiskLabel(walletInfo)}</span>
                    </div>
                    <div class="risk-factors">
                        ${generateRiskFactors(walletInfo, transactions)}
                    </div>
                </div>
            </div>
            
            <div class="transactions-section">
                <div class="transactions-header">
                    <h4><i class="fas fa-list"></i> تراکنش‌های اخیر</h4>
                    <div class="transaction-controls">
                        <div class="transaction-filters">
                            <button class="filter-btn active" onclick="filterTransactions('all')">همه</button>
                            <button class="filter-btn" onclick="filterTransactions('incoming')">دریافتی</button>
                            <button class="filter-btn" onclick="filterTransactions('outgoing')">ارسالی</button>
                            <button class="filter-btn" onclick="filterTransactions('large')">مبالغ بالا</button>
                        </div>
                        <div class="transaction-pagination">
                            <button class="pagination-btn" onclick="loadMoreTransactions('${address}', '${blockchain}')">
                                <i class="fas fa-plus"></i> بارگذاری بیشتر
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="transactions-stats">
                    <div class="stat-item">
                        <span class="stat-label">کل تراکنش‌ها:</span>
                        <span class="stat-value">${transactions.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">دریافتی:</span>
                        <span class="stat-value incoming">${countIncomingTransactions(transactions, address)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ارسالی:</span>
                        <span class="stat-value outgoing">${countOutgoingTransactions(transactions, address)}</span>
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
                                <th>تأییدات</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody id="transactionsTableBody">
                            ${generateTransactionsTable(transactions, address, blockchain)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="wallet-analytics">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>نمودار فعالیت والت</h4>
                        <canvas id="walletActivityChart"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h4>توزیع مبالغ تراکنش</h4>
                        <canvas id="transactionAmountsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    
    // رسم نمودارها
    setTimeout(() => {
        drawWalletActivityChart(transactions);
        drawTransactionAmountsChart(transactions, address);
    }, 100);
}

function getBlockchainName(blockchain) {
    const names = {
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        litecoin: 'Litecoin',
        'bitcoin-cash': 'Bitcoin Cash',
        dogecoin: 'Dogecoin'
    };
    return names[blockchain] || blockchain;
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
    
    // تبدیل از satoshi/wei به واحد اصلی
    let divisor = 100000000; // برای Bitcoin و مشابه
    if (blockchain === 'ethereum') {
        divisor = 1000000000000000000; // 18 decimal places
    }
    
    const formattedBalance = (parseFloat(balance) / divisor).toFixed(8);
    return `${formattedBalance} ${units[blockchain]}`;
}

function formatUSDValue(balance, blockchain) {
    // شبیه‌سازی قیمت‌های فعلی (در واقعیت باید از API قیمت استفاده کرد)
    const prices = {
        bitcoin: 43000,
        ethereum: 2500,
        litecoin: 70,
        'bitcoin-cash': 250,
        dogecoin: 0.08
    };
    
    if (!balance || !prices[blockchain]) return '';
    
    let divisor = 100000000;
    if (blockchain === 'ethereum') {
        divisor = 1000000000000000000;
    }
    
    const amount = parseFloat(balance) / divisor;
    const usdValue = amount * prices[blockchain];
    
    return `≈ $${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
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
    const balance = parseFloat(walletInfo.confirmedBalance || 0);
    const txCount = parseInt(walletInfo.transactionsCount || 0);
    
    // موجودی بالا
    if (balance > 1000000000) score += 30; // بیش از 10 BTC
    else if (balance > 100000000) score += 20; // بیش از 1 BTC
    else if (balance > 10000000) score += 10; // بیش از 0.1 BTC
    
    // تعداد تراکنش بالا
    if (txCount > 1000) score += 25;
    else if (txCount > 100) score += 15;
    else if (txCount > 10) score += 5;
    
    // فعالیت اخیر
    const lastActivity = walletInfo.lastSeenReceivingTransactionTime;
    if (lastActivity) {
        const daysSinceLastActivity = (Date.now() / 1000 - lastActivity) / (24 * 3600);
        if (daysSinceLastActivity < 1) score += 15; // فعالیت در 24 ساعت گذشته
        else if (daysSinceLastActivity < 7) score += 10; // فعالیت در هفته گذشته
    }
    
    return Math.min(score, 100);
}

function generateRiskFactors(walletInfo, transactions) {
    const factors = [];
    const balance = parseFloat(walletInfo.confirmedBalance || 0);
    const txCount = parseInt(walletInfo.transactionsCount || 0);
    
    if (balance > 1000000000) {
        factors.push('<span class="risk-factor high"><i class="fas fa-exclamation-triangle"></i> موجودی بسیار بالا</span>');
    } else if (balance > 100000000) {
        factors.push('<span class="risk-factor medium"><i class="fas fa-exclamation"></i> موجودی بالا</span>');
    }
    
    if (txCount > 1000) {
        factors.push('<span class="risk-factor medium"><i class="fas fa-exchange-alt"></i> تعداد تراکنش بالا</span>');
    }
    
    // بررسی الگوهای مشکوک در تراکنش‌ها
    const largeTxCount = transactions.filter(tx => {
        const amount = getTransactionAmount(tx, walletInfo.address);
        return amount > 100000000; // بیش از 1 BTC
    }).length;
    
    if (largeTxCount > 5) {
        factors.push('<span class="risk-factor high"><i class="fas fa-dollar-sign"></i> تراکنش‌های پرمبلغ متعدد</span>');
    }
    
    // فعالیت اخیر
    const lastActivity = walletInfo.lastSeenReceivingTransactionTime;
    if (lastActivity) {
        const daysSinceLastActivity = (Date.now() / 1000 - lastActivity) / (24 * 3600);
        if (daysSinceLastActivity < 1) {
            factors.push('<span class="risk-factor medium"><i class="fas fa-clock"></i> فعالیت اخیر</span>');
        }
    }
    
    if (factors.length === 0) {
        factors.push('<span class="risk-factor low"><i class="fas fa-check-circle"></i> فعالیت عادی</span>');
    }
    
    return factors.join(' ');
}

function countIncomingTransactions(transactions, address) {
    return transactions.filter(tx => isIncomingTransaction(tx, address)).length;
}

function countOutgoingTransactions(transactions, address) {
    return transactions.filter(tx => !isIncomingTransaction(tx, address)).length;
}

function generateTransactionsTable(transactions, address, blockchain) {
    if (!transactions || transactions.length === 0) {
        return '<tr><td colspan="7" class="no-transactions">تراکنشی یافت نشد</td></tr>';
    }
    
    return transactions.map(tx => {
        const isIncoming = isIncomingTransaction(tx, address);
        const amount = getTransactionAmount(tx, address);
        const confirmations = tx.minedInBlockHeight ? 'تأیید شده' : 'در انتظار';
        
        return `
            <tr class="transaction-row" data-type="${isIncoming ? 'incoming' : 'outgoing'}" data-amount="${amount}">
                <td class="tx-hash" onclick="showTransactionDetails('${tx.transactionId}', '${blockchain}')">
                    <span class="hash-short">${tx.transactionId.substring(0, 16)}...</span>
                    <i class="fas fa-external-link-alt"></i>
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
                <td class="tx-date">
                    ${formatDate(tx.timestamp)}
                </td>
                <td>
                    <span class="tx-status ${tx.minedInBlockHeight ? 'confirmed' : 'pending'}">
                        ${confirmations}
                    </span>
                </td>
                <td class="tx-confirmations">
                    ${tx.minedInBlockHeight ? '6+' : '0'}
                </td>
                <td class="tx-actions">
                    <button class="btn-analyze" onclick="analyzeTransaction('${tx.transactionId}', '${blockchain}')" title="تحلیل تراکنش">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="btn-flag" onclick="flagTransaction('${tx.transactionId}')" title="علامت‌گذاری مشکوک">
                        <i class="fas fa-flag"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function isIncomingTransaction(tx, address) {
    // بررسی اینکه آیا تراکنش ورودی است یا خروجی
    if (tx.recipients) {
        return tx.recipients.some(recipient => recipient.address === address);
    }
    return false;
}

function getTransactionAmount(tx, address) {
    // محاسبه مبلغ تراکنش برای آدرس مشخص
    let amount = 0;
    
    if (tx.recipients) {
        const recipient = tx.recipients.find(r => r.address === address);
        if (recipient) {
            amount = parseFloat(recipient.amount || 0);
        }
    }
    
    if (tx.senders && amount === 0) {
        const sender = tx.senders.find(s => s.address === address);
        if (sender) {
            amount = parseFloat(sender.amount || 0);
        }
    }
    
    return amount;
}

async function loadMoreTransactions(address, blockchain) {
    const currentCount = currentTransactions.length;
    
    try {
        showAlert('در حال بارگذاری تراکنش‌های بیشتر...', 'info');
        
        const newTransactions = await getWalletTransactions(blockchain, address, 50, currentCount);
        
        if (newTransactions.length === 0) {
            showAlert('تراکنش بیشتری یافت نشد', 'info');
            return;
        }
        
        currentTransactions = [...currentTransactions, ...newTransactions];
        
        // به‌روزرسانی جدول
        const tableBody = document.getElementById('transactionsTableBody');
        tableBody.innerHTML = generateTransactionsTable(currentTransactions, address, blockchain);
        
        showAlert(`${newTransactions.length} تراکنش جدید بارگذاری شد`, 'success');
        
    } catch (error) {
        console.error('Error loading more transactions:', error);
        showAlert('خطا در بارگذاری تراکنش‌های بیشتر', 'error');
    }
}

async function refreshWalletData(address, blockchain) {
    showAlert('در حال به‌روزرسانی اطلاعات...', 'info');
    await trackWallet();
}

async function showTransactionDetails(txId, blockchain) {
    try {
        showAlert('در حال دریافت جزئیات تراکنش...', 'info');
        
        const txDetails = await getTransactionDetails(blockchain, txId);
        
        // نمایش جزئیات در modal
        displayTransactionModal(txDetails, blockchain);
        
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        showAlert('خطا در دریافت جزئیات تراکنش', 'error');
    }
}

function displayTransactionModal(txDetails, blockchain) {
    const modal = document.createElement('div');
    modal.className = 'transaction-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exchange-alt"></i> جزئیات تراکنش</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tx-detail-grid">
                    <div class="detail-item">
                        <label>هش تراکنش:</label>
                        <span class="tx-hash-full">${txDetails.transactionId}</span>
                    </div>
                    <div class="detail-item">
                        <label>بلاک:</label>
                        <span>${txDetails.minedInBlockHeight || 'در انتظار'}</span>
                    </div>
                    <div class="detail-item">
                        <label>تاریخ:</label>
                        <span>${formatDate(txDetails.timestamp)}</span>
                    </div>
                    <div class="detail-item">
                        <label>کارمزد:</label>
                        <span>${formatBalance(txDetails.fee, blockchain)}</span>
                    </div>
                    <div class="detail-item">
                        <label>اندازه:</label>
                        <span>${txDetails.size || 'نامشخص'} bytes</span>
                    </div>
                    <div class="detail-item">
                        <label>تأییدات:</label>
                        <span>${txDetails.minedInBlockHeight ? '6+' : '0'}</span>
                    </div>
                </div>
                
                <div class="tx-inputs-outputs">
                    <div class="inputs-section">
                        <h4>ورودی‌ها</h4>
                        <div class="addresses-list">
                            ${generateAddressesList(txDetails.senders || [])}
                        </div>
                    </div>
                    <div class="outputs-section">
                        <h4>خروجی‌ها</h4>
                        <div class="addresses-list">
                            ${generateAddressesList(txDetails.recipients || [])}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">بستن</button>
                <button class="btn-primary" onclick="flagTransaction('${txDetails.transactionId}')">
                    <i class="fas fa-flag"></i> علامت‌گذاری مشکوک
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function generateAddressesList(addresses) {
    if (!addresses || addresses.length === 0) {
        return '<p class="no-addresses">آدرسی یافت نشد</p>';
    }
    
    return addresses.map(addr => `
        <div class="address-item">
            <span class="address">${addr.address}</span>
            <span class="amount">${formatBalance(addr.amount, 'bitcoin')}</span>
        </div>
    `).join('');
}

function closeModal() {
    const modal = document.querySelector('.transaction-modal');
    if (modal) {
        modal.remove();
    }
}

function analyzeTransaction(txId, blockchain) {
    showAlert(`شروع تحلیل تراکنش ${txId.substring(0, 16)}...`, 'info');
    
    // شبیه‌سازی تحلیل
    setTimeout(() => {
        const riskScore = Math.floor(Math.random() * 100);
        const riskLevel = riskScore > 70 ? 'بالا' : riskScore > 40 ? 'متوسط' : 'پایین';
        
        showAlert(`تحلیل کامل شد. سطح ریسک: ${riskLevel} (${riskScore}%)`, 'info');
    }, 2000);
}

function flagTransaction(txId) {
    if (confirm('آیا می‌خواهید این تراکنش را به عنوان مشکوک علامت‌گذاری کنید؟')) {
        // ذخیره در لیست تراکنش‌های مشکوک
        const flaggedTx = JSON.parse(localStorage.getItem('flaggedTransactions') || '[]');
        flaggedTx.push({
            txId: txId,
            timestamp: Date.now(),
            reason: 'علامت‌گذاری دستی توسط کاربر'
        });
        localStorage.setItem('flaggedTransactions', JSON.stringify(flaggedTx));
        
        showAlert('تراکنش به عنوان مشکوک علامت‌گذاری شد', 'success');
    }
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
        const amount = parseFloat(row.getAttribute('data-amount'));
        
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
                show = amount > 100000000; // بیش از 1 BTC
                break;
        }
        
        row.style.display = show ? '' : 'none';
    });
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
                tension: 0.4,
                fill: true
            }]
        },
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
                    beginAtZero: true
                }
            }
        }
    });
}

function drawTransactionAmountsChart(transactions, address) {
    const ctx = document.getElementById('transactionAmountsChart');
    if (!ctx) return;
    
    // تقسیم‌بندی تراکنش‌ها بر اساس مبلغ
    const ranges = {
        'کم (< 0.01)': 0,
        'متوسط (0.01-0.1)': 0,
        'بالا (0.1-1)': 0,
        'خیلی بالا (> 1)': 0
    };
    
    transactions.forEach(tx => {
        const amount = getTransactionAmount(tx, address) / 100000000; // تبدیل به BTC
        
        if (amount < 0.01) ranges['کم (< 0.01)']++;
        else if (amount < 0.1) ranges['متوسط (0.01-0.1)']++;
        else if (amount < 1) ranges['بالا (0.1-1)']++;
        else ranges['خیلی بالا (> 1)']++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                data: Object.values(ranges),
                backgroundColor: [
                    '#2ecc71',
                    '#f39c12',
                    '#e67e22',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
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
    
    const labels = Object.keys(dailyCount).slice(-30); // 30 روز اخیر
    const data = labels.map(label => dailyCount[label] || 0);
    
    return { labels, data };
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>در حال دریافت اطلاعات از بلاک‌چین...</p>
            <small>این عملیات ممکن است چند ثانیه طول بکشد</small>
        </div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>خطا در دریافت اطلاعات</h3>
            <p>${message}</p>
            <div class="error-actions">
                <button class="retry-btn" onclick="trackWallet()">
                    <i class="fas fa-redo"></i> تلاش مجدد
                </button>
                <button class="settings-btn" onclick="openSettings()">
                    <i class="fas fa-cog"></i> تنظیمات API
                </button>
            </div>
        </div>
    `;
}

function openSettings() {
    // انتقال به بخش تنظیمات
    const settingsLink = document.querySelector('[data-section="settings"]');
    if (settingsLink) {
        settingsLink.click();
    }
}

function getApiKey() {
    // دریافت API Key از تنظیمات
    return localStorage.getItem('cryptoapis_key') || '';
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
    }).catch(() => {
        // Fallback برای مرورگرهای قدیمی
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showAlert('آدرس کپی شد', 'success');
    });
}

function exportWalletData(address) {
    if (!currentWalletData || !currentTransactions) {
        showAlert('ابتدا اطلاعات والت را بارگذاری کنید', 'warning');
        return;
    }
    
    const exportData = {
        wallet: currentWalletData,
        transactions: currentTransactions,
        exportDate: new Date().toISOString(),
        address: address
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `wallet_${address.substring(0, 10)}_${Date.now()}.json`;
    link.click();
    
    showAlert('داده‌های والت صادر شد', 'success');
}

function addToMonitoring(address, blockchain) {
    const monitoredWallets = JSON.parse(localStorage.getItem('monitored_wallets') || '[]');
    
    // بررسی تکراری نبودن
    const exists = monitoredWallets.some(w => w.address === address);
    if (exists) {
        showAlert('این والت قبلاً در لیست نظارت قرار دارد', 'warning');
        return;
    }
    
    monitoredWallets.push({
        address,
        blockchain,
        addedDate: Date.now(),
        lastCheck: Date.now()
    });
    
    localStorage.setItem('monitored_wallets', JSON.stringify(monitoredWallets));
    showAlert('والت به لیست نظارت مداوم اضافه شد', 'success');
}

function fillSampleAddress(address, blockchain) {
    document.getElementById('walletAddress').value = address;
    document.getElementById('blockchainSelect').value = blockchain;
    showAlert('آدرس نمونه پر شد', 'success');
}
