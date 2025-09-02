// BTC Price Chart (empty for now)
const ctx = document.getElementById('btcPriceChart').getContext('2d');
const btcPriceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // خالی
        datasets: [{
            label: 'قیمت بیت‌کوین (USD)',
            data: [], // خالی
            borderColor: 'orange',
            borderWidth: 2,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: 'زمان' } },
            y: { title: { display: true, text: 'قیمت (USD)' } }
        }
    }
});
