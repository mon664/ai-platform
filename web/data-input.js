// AI CLI - Data Input Page JavaScript

const API_BASE_URL = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupFormListeners();
});

async function loadInitialData() {
    try {
        // Load products for sales and inventory forms
        const products = await fetchApi('/products');
        populateProductSelects(products);

        // Load dashboard stats
        const analytics = await fetchApi('/analytics/dashboard');
        updateDashboard(analytics);

    } catch (error) {
        console.error('Failed to load initial data:', error);
        logActivity('초기 데이터 로드 실패', 'error');
    }
}

function setupFormListeners() {
    document.getElementById('salesForm').addEventListener('submit', handleSalesSubmit);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('inventoryForm').addEventListener('submit', handleInventorySubmit);
    document.getElementById('temperatureForm').addEventListener('submit', handleTemperatureSubmit);
    document.getElementById('haccpForm').addEventListener('submit', handleHaccpSubmit);

    // Add event listener for sales item changes to update total
    document.getElementById('salesItems').addEventListener('change', updateSalesTotal);
}

// API Fetch Utility
async function fetchApi(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }
    return response.json();
}

// Populate Product Selects
function populateProductSelects(products) {
    const salesSelect = document.querySelector('#salesItems select[name="product_id"]');
    const inventorySelect = document.getElementById('inventoryProduct');

    [salesSelect, inventorySelect].forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">상품 선택</option>'; // Clear existing
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.unit_price.toLocaleString()}원)`;
            option.dataset.price = product.unit_price;
            select.appendChild(option);
        });
    });
}

// Update Dashboard Stats
function updateDashboard(analytics) {
    document.getElementById('totalSales').textContent = `${analytics.today.sales.toLocaleString()}원`;
    document.getElementById('totalProducts').textContent = 'N/A'; // This info is not in the analytics endpoint
    document.getElementById('lowStockItems').textContent = `${analytics.lowStock.length}개`;
    document.getElementById('todayOrders').textContent = `${analytics.today.orders}건`;
}

// Sales Form
function addSalesItem() {
    const salesItemsContainer = document.getElementById('salesItems');
    const newItem = salesItemsContainer.children[0].cloneNode(true);
    newItem.querySelector('select').selectedIndex = 0;
    newItem.querySelectorAll('input').forEach(input => input.value = '');
    salesItemsContainer.appendChild(newItem);
}

function removeSalesItem(button) {
    const itemDiv = button.parentElement;
    if (document.getElementById('salesItems').children.length > 1) {
        itemDiv.remove();
        updateSalesTotal();
    }
}

function updateSalesTotal() {
    let total = 0;
    const items = document.querySelectorAll('#salesItems > div');
    items.forEach(item => {
        const select = item.querySelector('select[name="product_id"]');
        const quantityInput = item.querySelector('input[name="quantity"]');
        const priceInput = item.querySelector('input[name="unit_price"]');
        
        const selectedOption = select.options[select.selectedIndex];
        const price = parseFloat(priceInput.value || selectedOption.dataset.price || 0);
        const quantity = parseInt(quantityInput.value) || 0;

        if (!priceInput.value && selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
        }
        
        total += quantity * price;
    });
    document.getElementById('salesTotal').textContent = total.toLocaleString();
}

async function handleSalesSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const customer_name = form.querySelector('input[name="customer_name"]').value;
    const notes = form.querySelector('textarea[name="notes"]').value;
    const items = [];

    document.querySelectorAll('#salesItems > div').forEach(item => {
        const product_id = item.querySelector('select[name="product_id"]').value;
        const quantity = item.querySelector('input[name="quantity"]').value;
        const unit_price = item.querySelector('input[name="unit_price"]').value;
        if (product_id && quantity && unit_price) {
            items.push({ product_id, quantity, unit_price });
        }
    });

    if (items.length === 0) {
        alert('상품을 하나 이상 추가해주세요.');
        return;
    }

    try {
        const result = await fetchApi('/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name, items, notes }),
        });
        logActivity(`매출 등록 완료 (ID: ${result.id})`, 'success');
        form.reset();
        updateSalesTotal();
    } catch (error) {
        logActivity(`매출 등록 실패: ${error.message}`, 'error');
    }
}

// Product Form
async function handleProductSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await fetchApi('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        logActivity(`상품 등록 완료: ${data.name}`, 'success');
        form.reset();
        loadInitialData(); // Refresh product lists
    } catch (error) {
        logActivity(`상품 등록 실패: ${error.message}`, 'error');
    }
}

// Inventory Form
async function handleInventorySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // This form doesn't have an ID for the item, so we assume it's for creating new inventory.
    // The backend expects a PUT to /api/inventory/:id, which is a mismatch.
    // Let's adapt to create a new inventory item if it doesn't exist, or update if it does.
    // This requires a more complex logic, for now, we'll just log the attempt.
    
    logActivity('재고 관리 기능은 현재 검토 중입니다.', 'warning');
    alert('재고 관리 로직에 수정이 필요합니다. 현재는 재고 업데이트가 비활성화되어 있습니다.');

    // A proper implementation would be:
    // 1. Check if inventory for the selected product_id already exists.
    // 2. If yes, get its ID and send a PUT request.
    // 3. If no, send a POST request to a new endpoint (e.g., POST /api/inventory) to create it.
    // The backend currently only supports UPDATE, not CREATE for inventory.
}


// Temperature Form
async function handleTemperatureSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await fetchApi('/temperature-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        logActivity(`온도 기록 완료: ${data.location} - ${data.temperature}°C`, 'success');
        form.reset();
    } catch (error) {
        logActivity(`온도 기록 실패: ${error.message}`, 'error');
    }
}

// HACCP Form
async function handleHaccpSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await fetchApi('/haccp-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        logActivity(`HACCP 기록 완료: ${data.check_type}`, 'success');
        form.reset();
    } catch (error) {
        logActivity(`HACCP 기록 실패: ${error.message}`, 'error');
    }
}

// Activity Log
function logActivity(message, type = 'info') {
    const logContainer = document.getElementById('activityLog');
    const newLog = document.createElement('p');
    
    const colors = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-gray-600'
    };

    newLog.className = `${colors[type]} text-sm`;
    newLog.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

    if (logContainer.children.length > 0 && logContainer.children[0].textContent === '최근 활동이 없습니다.') {
        logContainer.innerHTML = '';
    }

    logContainer.prepend(newLog);

    // Limit log entries
    while (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.lastChild);
    }
}
