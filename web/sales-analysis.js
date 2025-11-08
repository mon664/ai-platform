// 매출 분석 페이지 JavaScript
let salesChart = null;
let productChart = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await loadNavigation();
    await loadSalesData();
    await initializeCharts();
});

// 네비게이션 로드
async function loadNavigation() {
    try {
        const response = await fetch('navigation.html');
        if (!response.ok) {
            throw new Error('네비게이션 파일 로드 실패');
        }
        const navigationHTML = await response.text();
        const container = document.getElementById('navigation-container');
        if (container) {
            container.innerHTML = navigationHTML;

            // 현재 페이지 강조
            highlightCurrentPage();
        } else {
            console.error('네비게이션 컨테이너를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('네비게이션 로드 실패:', error);
        // 대체 간단 네비게이션 표시
        const container = document.getElementById('navigation-container');
        if (container) {
            container.innerHTML = `
                <nav class="bg-blue-600 text-white p-4">
                    <div class="max-w-7xl mx-auto flex justify-between">
                        <h1 class="text-xl font-bold">AI 경리봇</h1>
                        <div class="space-x-4">
                            <a href="index.html" class="hover:underline">대시보드</a>
                            <a href="data-input.html" class="hover:underline">데이터 입력</a>
                            <a href="sales-analysis.html" class="hover:underline">매출 분석</a>
                        </div>
                    </div>
                </nav>
            `;
        }
    }
}

// 현재 페이지 강조
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('bg-white', 'bg-opacity-20');
        } else {
            item.classList.remove('bg-white', 'bg-opacity-20');
        }
    });
}

// 매출 데이터 로드
async function loadSalesData() {
    try {
        const response = await axios.get('http://localhost:3001/api/sales');
        const sales = response.data;

        // 통계 계산
        updateStatistics(sales);

        // 테이블 업데이트
        updateSalesTable(sales);

    } catch (error) {
        console.error('매출 데이터 로드 실패:', error);
    }
}

// 통계 업데이트
function updateStatistics(sales) {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.order_date.startsWith(today));

    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const avgOrderValue = todaySales.length > 0 ? totalSales / todaySales.length : 0;

    document.getElementById('todaySales').textContent = formatCurrency(totalSales);
    document.getElementById('todayOrders').textContent = todaySales.length + '건';
    document.getElementById('avgOrderValue').textContent = formatCurrency(avgOrderValue);

    // 인기 상품 계산 (간단히 첫 번째 상품)
    if (sales.length > 0 && sales[0].items_list) {
        const topProduct = sales[0].items_list.split(' x ')[0];
        document.getElementById('topProduct').textContent = topProduct;
    }
}

// 매출 테이블 업데이트
function updateSalesTable(sales) {
    const tableBody = document.getElementById('salesTable');

    if (sales.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">매출 데이터가 없습니다.</td></tr>';
        return;
    }

    tableBody.innerHTML = sales.slice(0, 10).map(sale => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sale.customer_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.items_list}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.items_total || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${formatCurrency(sale.total_amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(sale.order_date)}</td>
        </tr>
    `).join('');
}

// 차트 초기화
async function initializeCharts() {
    // 매출 추세 차트
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['1일', '2일', '3일', '4일', '5일', '6일', '7일'],
            datasets: [{
                label: '일별 매출',
                data: [650000, 780000, 900000, 810000, 960000, 827500, 950000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + '원';
                        }
                    }
                }
            }
        }
    });

    // 상품별 매출 차트
    const productCtx = document.getElementById('productChart').getContext('2d');
    productChart = new Chart(productCtx, {
        type: 'doughnut',
        data: {
            labels: ['김치찌개', '소불고기', '갈비탕', '된장찌개', '김치'],
            datasets: [{
                data: [160000, 60000, 30000, 112500, 375000],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// 통화 형식
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

// 날짜 형식
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}