// 데이터 입력 관련 JavaScript
let salesItems = [];
let editingSalesItemId = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    await loadNavigation();
    await loadProducts();
    await loadStats();
    await loadActivityLog();

    // 폼 이벤트 리스너 설정
    setupFormListeners();

    // 판매 품목 동적 계산
    setupSalesItemCalculation();
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

// 제품 목록 로드
async function loadProducts() {
    try {
        const response = await axios.get('http://localhost:3001/api/products');
        const products = response.data;

        console.log('로드된 제품:', products); // 디버그용 로그

        // 모든 제품 선택 요소 업데이트
        const productSelects = document.querySelectorAll('select[name="product_id"]');
        productSelects.forEach(select => {
            select.innerHTML = '<option value="">상품 선택</option>';
            products.forEach(product => {
                select.innerHTML += `<option value="${product.id}">${product.name} (${product.unit})</option>`;
            });
        });

        // 재고 폼의 제품 선택 목록 업데이트
        const inventorySelect = document.getElementById('inventoryProduct');
        if (inventorySelect) {
            inventorySelect.innerHTML = '<option value="">상품 선택</option>';
            products.forEach(product => {
                inventorySelect.innerHTML += `<option value="${product.id}">${product.name}</option>`;
            });
        }

        showNotification(`제품 ${products.length}개를 로드했습니다.`, 'success');

    } catch (error) {
        console.error('제품 목록 로드 실패:', error);
        showNotification('제품 목록을 불러오는데 실패했습니다: ' + error.message, 'error');
    }
}

// 통계 로드
async function loadStats() {
    try {
        const response = await axios.get('http://localhost:3001/api/analytics/dashboard');
        const stats = response.data;

        document.getElementById('totalSales').textContent = formatCurrency(stats.today?.sales || 0);
        document.getElementById('totalProducts').textContent = '9개'; // 현재 등록된 제품 수
        document.getElementById('lowStockItems').textContent = (stats.lowStock?.length || 0) + '개';
        document.getElementById('todayOrders').textContent = (stats.today?.orders || 0) + '건';

    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
}

// 활동 로그 로드
async function loadActivityLog() {
    try {
        // 활동 로그는 현재 API가 없으므로 건너뜀
    return;
        const activities = response.data;

        const logContainer = document.getElementById('activityLog');
        if (activities.length === 0) {
            logContainer.innerHTML = '<p class="text-gray-500">최근 활동이 없습니다.</p>';
        } else {
            logContainer.innerHTML = activities.map(activity => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span class="text-sm text-gray-700">${activity.description}</span>
                    <span class="text-xs text-gray-500">${formatTime(activity.created_at)}</span>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('활동 로그 로드 실패:', error);
    }
}

// 폼 이벤트 리스너 설정
function setupFormListeners() {
    // 매출 폼
    document.getElementById('salesForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitSales();
    });

    // 제품 폼
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitProduct();
    });

    // 재고 폼
    document.getElementById('inventoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitInventory();
    });

    // 온도 폼
    document.getElementById('temperatureForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitTemperature();
    });

    // HACCP 폼
    document.getElementById('haccpForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitHACCP();
    });
}

// 판매 품목 계산 설정
function setupSalesItemCalculation() {
    document.addEventListener('input', function(e) {
        if (e.target.name === 'quantity' || e.target.name === 'unit_price') {
            calculateSalesTotal();
        }
    });
}

// 판매 품목 추가
async function addSalesItem() {
    const container = document.getElementById('salesItems');
    const itemId = ++editingSalesItemId;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'flex items-center space-x-2';
    itemDiv.dataset.itemId = itemId;

    // 제품 목록을 API로부터 가져오기
    let productOptions = '<option value="">상품 선택</option>';
    try {
        const response = await axios.get('http://localhost:3001/api/products');
        const products = response.data;
        productOptions = '<option value="">상품 선택</option>';
        products.forEach(product => {
            productOptions += `<option value="${product.id}">${product.name} (${product.unit})</option>`;
        });
    } catch (error) {
        console.error('제품 목록 로드 실패:', error);
    }

    itemDiv.innerHTML = `
        <select name="product_id" class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            ${productOptions}
        </select>
        <input type="number" name="quantity" placeholder="수량" min="1"
               class="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <input type="number" name="unit_price" placeholder="단가" min="0"
               class="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <button type="button" onclick="addSalesItem()"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            +
        </button>
        <button type="button" onclick="removeSalesItem(this)"
                class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            -
        </button>
    `;

    container.appendChild(itemDiv);
}

// 판매 품목 제거
function removeSalesItem(button) {
    const itemDiv = button.parentElement;
    if (document.querySelectorAll('#salesItems > div').length > 1) {
        itemDiv.remove();
        calculateSalesTotal();
    } else {
        showNotification('최소 1개의 상품은 필요합니다.', 'warning');
    }
}

// 판매 총액 계산
function calculateSalesTotal() {
    let total = 0;
    const items = document.querySelectorAll('#salesItems > div');

    items.forEach(item => {
        const quantity = parseInt(item.querySelector('input[name="quantity"]').value) || 0;
        const unitPrice = parseInt(item.querySelector('input[name="unit_price"]').value) || 0;
        total += quantity * unitPrice;
    });

    document.getElementById('salesTotal').textContent = total.toLocaleString();
}

// 매출 제출
async function submitSales() {
    try {
        const formData = new FormData(document.getElementById('salesForm'));
        const customerName = formData.get('customer_name');
        const notes = formData.get('notes');

        // 판매 품목 수집
        const items = [];
        const itemDivs = document.querySelectorAll('#salesItems > div');

        for (const itemDiv of itemDivs) {
            const productId = itemDiv.querySelector('select[name="product_id"]').value;
            const quantity = parseInt(itemDiv.querySelector('input[name="quantity"]').value);
            const unitPrice = parseInt(itemDiv.querySelector('input[name="unit_price"]').value);

            if (productId && quantity && unitPrice) {
                items.push({
                    product_id: productId,
                    quantity: quantity,
                    unit_price: unitPrice
                });
            }
        }

        if (items.length === 0) {
            showNotification('최소 1개의 상품을 추가해주세요.', 'warning');
            return;
        }

        const salesData = {
            customer_name: customerName,
            items: items,
            notes: notes,
            total_amount: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        };

        const response = await axios.post('http://localhost:3001/api/sales', salesData);

        if (response.data.success) {
            showNotification('매출이 성공적으로 등록되었습니다.', 'success');
            document.getElementById('salesForm').reset();
            calculateSalesTotal();
            await loadStats();
            await loadActivityLog();
        } else {
            showNotification('매출 등록에 실패했습니다: ' + response.data.message, 'error');
        }

    } catch (error) {
        console.error('매출 제출 실패:', error);
        showNotification('매출 등록 중 오류가 발생했습니다.', 'error');
    }
}

// 제품 제출
async function submitProduct() {
    try {
        const formData = new FormData(document.getElementById('productForm'));
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            unit: formData.get('unit'),
            unit_price: parseInt(formData.get('unit_price')),
            cost: parseInt(formData.get('cost'))
        };

        const response = await axios.post('http://localhost:3001/api/products', productData);

        if (response.data.success) {
            showNotification('제품이 성공적으로 등록되었습니다.', 'success');
            document.getElementById('productForm').reset();
            await loadProducts();
            await loadStats();
            await loadActivityLog();
        } else {
            showNotification('제품 등록에 실패했습니다: ' + response.data.message, 'error');
        }

    } catch (error) {
        console.error('제품 제출 실패:', error);
        showNotification('제품 등록 중 오류가 발생했습니다.', 'error');
    }
}

// 재고 제출
async function submitInventory() {
    try {
        const formData = new FormData(document.getElementById('inventoryForm'));
        const inventoryData = {
            product_id: formData.get('product_id'),
            quantity: parseInt(formData.get('quantity')),
            min_quantity: parseInt(formData.get('min_quantity')),
            location: formData.get('location')
        };

        // 재고 엔드포인트가 없으므로 일단 주석 처리
        showNotification('재고 업데이트 기능은 현재 개발 중입니다.', 'warning');
        return;

        if (response.data.success) {
            showNotification('재고가 성공적으로 업데이트되었습니다.', 'success');
            document.getElementById('inventoryForm').reset();
            await loadStats();
            await loadActivityLog();
        } else {
            showNotification('재고 업데이트에 실패했습니다: ' + response.data.message, 'error');
        }

    } catch (error) {
        console.error('재고 제출 실패:', error);
        showNotification('재고 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 온도 기록 제출
async function submitTemperature() {
    try {
        const formData = new FormData(document.getElementById('temperatureForm'));
        const tempData = {
            location: formData.get('location'),
            temperature: parseFloat(formData.get('temperature')),
            notes: formData.get('notes')
        };

        const response = await axios.post('http://localhost:3001/api/temperature-records', tempData);

        if (response.data.success) {
            showNotification('온도가 성공적으로 기록되었습니다.', 'success');
            document.getElementById('temperatureForm').reset();
            await loadActivityLog();
        } else {
            showNotification('온도 기록에 실패했습니다: ' + response.data.message, 'error');
        }

    } catch (error) {
        console.error('온도 기록 제출 실패:', error);
        showNotification('온도 기록 중 오류가 발생했습니다.', 'error');
    }
}

// HACCP 기록 제출
async function submitHACCP() {
    try {
        const formData = new FormData(document.getElementById('haccpForm'));
        const haccpData = {
            check_type: formData.get('check_type'),
            status: formData.get('status'),
            details: formData.get('details'),
            inspector: formData.get('inspector')
        };

        const response = await axios.post('http://localhost:3001/api/haccp-records', haccpData);

        if (response.data.success) {
            showNotification('HACCP 기록이 성공적으로 등록되었습니다.', 'success');
            document.getElementById('haccpForm').reset();
            await loadActivityLog();
        } else {
            showNotification('HACCP 기록에 실패했습니다: ' + response.data.message, 'error');
        }

    } catch (error) {
        console.error('HACCP 기록 제출 실패:', error);
        showNotification('HACCP 기록 중 오류가 발생했습니다.', 'error');
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 통화 형식
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

// 시간 형식
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '방금';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
    return `${Math.floor(diffMins / 1440)}일 전`;
}