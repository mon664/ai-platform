// AI CLI Web Interface JavaScript

// State Management
const state = {
    isDarkMode: false,
    currentLanguage: 'ko',
    aiModel: 'gpt-4',
    businessType: 'food',
    // Mock data for demonstration
    inventoryData: {
        '배추김치': { current: 45, safe: 50, unit: 'kg' },
        '된장찌개': { current: 30, safe: 40, unit: 'kg' },
        '순대': { current: 15, safe: 25, unit: 'kg' },
        '김': { current: 80, safe: 100, unit: '장' },
        '고춧가루': { current: 5, safe: 10, unit: 'kg' }
    },
    salesData: {
        daily: 5000000,
        weekly: 35000000,
        monthly: 150000000,
        products: [
            { name: '김치찌개', sales: 2500000, percentage: 50 },
            { name: '된장찌개', sales: 1800000, percentage: 36 },
            { name: '순대', sales: 700000, percentage: 14 }
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    checkSystemTheme();
});

// Load saved settings
function loadSettings() {
    const savedTheme = localStorage.getItem('darkMode');
    const savedLanguage = localStorage.getItem('language');
    const savedModel = localStorage.getItem('aiModel');

    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        state.isDarkMode = true;
        updateThemeIcon();
    }

    if (savedLanguage) {
        document.getElementById('language').value = savedLanguage;
        state.currentLanguage = savedLanguage;
    }

    if (savedModel) {
        document.getElementById('aiModel').value = savedModel;
        state.aiModel = savedModel;
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('language').addEventListener('change', (e) => {
        state.currentLanguage = e.target.value;
        localStorage.setItem('language', e.target.value);
        updateInterfaceLanguage();
    });

    document.getElementById('aiModel').addEventListener('change', (e) => {
        state.aiModel = e.target.value;
        localStorage.setItem('aiModel', e.target.value);
    });

    document.getElementById('defaultCommitType').addEventListener('change', (e) => {
        localStorage.setItem('defaultCommitType', e.target.value);
    });
}

// Theme Management
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', state.isDarkMode);
    updateThemeIcon();
}

function checkSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (localStorage.getItem('darkMode') === null) {
            document.body.classList.add('dark-mode');
            state.isDarkMode = true;
            updateThemeIcon();
        }
    }
}

function updateThemeIcon() {
    const icon = document.querySelector('.fa-moon');
    if (state.isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// AI Functions
async function generateCommitMessage() {
    const input = document.getElementById('commitInput').value.trim();
    const context = document.getElementById('commitContext').value.trim();
    const button = event.target;
    const resultDiv = document.getElementById('commitResult');
    const messageDiv = document.getElementById('commitMessage');

    if (!input) {
        showNotification('코드 변경 내용을 입력해주세요.', 'warning');
        return;
    }

    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>생성 중...';

    try {
        // Simulate AI processing
        await simulateAIProcessing();

        const commitType = document.getElementById('defaultCommitType').value;
        const generatedMessage = generateMockCommitMessage(input, context, commitType);

        // Show result
        messageDiv.textContent = generatedMessage;
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');

        showNotification('커밋 메시지가 생성되었습니다!', 'success');

    } catch (error) {
        showNotification('오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic mr-2"></i>커밋 메시지 생성';
    }
}

async function explainChanges() {
    const beforeCode = document.getElementById('beforeCode').value.trim();
    const afterCode = document.getElementById('afterCode').value.trim();
    const detailed = document.getElementById('detailedExplanation').checked;
    const button = event.target;
    const resultDiv = document.getElementById('explanationResult');
    const contentDiv = document.getElementById('explanationContent');

    if (!beforeCode || !afterCode) {
        showNotification('변경 전후 코드를 모두 입력해주세요.', 'warning');
        return;
    }

    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';

    try {
        // Simulate AI processing
        await simulateAIProcessing();

        const explanation = generateMockExplanation(beforeCode, afterCode, detailed);

        // Show result
        contentDiv.innerHTML = explanation;
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');

        showNotification('코드 변경 분석이 완료되었습니다!', 'success');

    } catch (error) {
        showNotification('오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-search mr-2"></i>변경 사항 분석';
    }
}

// Mock AI Functions (실제 AI 연동 시 교체)
function generateMockCommitMessage(input, context, type) {
    const templates = {
        feat: [
            `feat(${extractScope(input)}): ${extractDescription(input)}`,
            `feat: ${extractDescription(input)}`,
            `feat(${extractScope(input)}): add ${extractDescription(input)} functionality`
        ],
        fix: [
            `fix(${extractScope(input)}): resolve ${extractDescription(input)}`,
            `fix: ${extractDescription(input)}`,
            `fix(${extractScope(input)}): fix issue with ${extractDescription(input)}`
        ],
        docs: [
            `docs: update ${extractDescription(input)}`,
            `docs(${extractScope(input)}): improve ${extractDescription(input)} documentation`,
            `docs: add ${extractDescription(input)} guide`
        ]
    };

    const typeTemplates = templates[type] || templates.feat;
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    let message = template;

    if (context) {
        message += `\n\n${context}`;
    }

    message += `\n\n- ${generateBulletPoint(input)}`;
    message += `\n- ${generateBulletPoint(input)}`;

    return message;
}

function generateMockExplanation(before, after, detailed) {
    const changes = detectChanges(before, after);

    let html = '<div class="space-y-3">';

    // Summary
    html += `
        <div>
            <h4 class="font-semibold text-gray-900 mb-1">📋 변경 요약</h4>
            <p class="text-gray-700">이 변경은 ${changes.summary}에 관한 것입니다.</p>
        </div>
    `;

    // Technical Details
    html += `
        <div>
            <h4 class="font-semibold text-gray-900 mb-1">⚙️ 기술적 세부사항</h4>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
                <li>${changes.technical}</li>
                <li>${changes.technical}</li>
            </ul>
        </div>
    `;

    // Reasoning
    html += `
        <div>
            <h4 class="font-semibold text-gray-900 mb-1">🤔 변경 이유</h4>
            <p class="text-gray-700">${changes.reasoning}</p>
        </div>
    `;

    if (detailed) {
        // Impact
        html += `
            <div>
                <h4 class="font-semibold text-gray-900 mb-1">🎯 영향</h4>
                <p class="text-gray-700">${changes.impact}</p>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Helper Functions
function extractScope(input) {
    const scopes = ['auth', 'api', 'ui', 'database', 'utils', 'config'];
    for (const scope of scopes) {
        if (input.toLowerCase().includes(scope)) {
            return scope;
        }
    }
    return 'core';
}

function extractDescription(input) {
    const keywords = {
        '인증': 'authentication',
        '로그인': 'login',
        '사용자': 'user',
        '데이터': 'data',
        'API': 'API endpoint',
        '화면': 'UI component',
        '테스트': 'test coverage',
        '버그': 'bug fix',
        '기능': 'feature'
    };

    for (const [korean, english] of Object.entries(keywords)) {
        if (input.includes(korean)) {
            return english;
        }
    }

    return 'new functionality';
}

function generateBulletPoint(input) {
    const templates = [
        'Improve code structure and readability',
        'Add error handling for edge cases',
        'Optimize performance and reduce latency',
        'Update documentation and comments',
        'Ensure backward compatibility'
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

function detectChanges(before, after) {
    const beforeLines = before.split('\n').length;
    const afterLines = after.split('\n').length;
    const diff = afterLines - beforeLines;

    return {
        summary: diff > 0 ? '기능 확장' : diff < 0 ? '코드 최적화' : '리팩토링',
        technical: diff > 0 ? '새로운 기능과 메서드 추가' : diff < 0 ? '불필요한 코드 제거 및 간소화' : '코드 구조 개선 및 가독성 향상',
        reasoning: '사용자 경험 개선과 코드 유지보수성 향상을 위해 진행',
        impact: '애플리케이션의 안정성과 확장성이 향상될 것입니다'
    };
}

async function simulateAIProcessing() {
    return new Promise(resolve => setTimeout(resolve, 1500));
}

// Utility Functions
function copyCommitMessage() {
    const message = document.getElementById('commitMessage').textContent;
    copyToClipboard(message);
    showNotification('커밋 메시지가 복사되었습니다!', 'success');
}

function copyExplanation() {
    const explanation = document.getElementById('explanationContent').textContent;
    copyToClipboard(explanation);
    showNotification('분석 결과가 복사되었습니다!', 'success');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('복사 실패:', err);
        showNotification('복사에 실패했습니다.', 'error');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in max-w-sm`;

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    notification.classList.add(...colors[type].split(' '));
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateInterfaceLanguage() {
    // Language switching logic can be implemented here
    console.log('Language changed to:', state.currentLanguage);
}

// AI Chat Functions
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addChatMessage(message, 'user');

    // Clear input
    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'ai');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatHistory = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-2 fade-in';

    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="bg-blue-100 p-2 rounded-lg">
                <i class="fas fa-user text-blue-600 text-sm"></i>
            </div>
            <div class="bg-blue-100 rounded-lg p-3 max-w-xs">
                <p class="text-sm text-gray-700">${message}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="bg-purple-100 p-2 rounded-lg">
                <i class="fas fa-robot text-purple-600 text-sm"></i>
            </div>
            <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p class="text-sm text-gray-700">${message}</p>
            </div>
        `;
    }

    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function generateAIResponse(message) {
    const responses = {
        '매출 분석해줘': '📊 오늘 매출 분석 결과입니다:\n• 총매출: 5,000,000원\n• 김치찌개: 2,500,000원 (50%)\n• 된장찌개: 1,800,000원 (36%)\n• 순대: 700,000원 (14%)\n• 예상순이익: 1,900,000원 (38%)',
        '재고 현황 알려줘': '📦 현재 재고 현황입니다:\n⚠️ 배추김치: 45/50kg (부족 5kg)\n✅ 된장찌개: 30/40kg\n✅ 순대: 15/25kg\n⚠️ 김: 80/100장 (부족 20장)\n자동 발주가 필요한 품목이 있습니다.',
        '생산 지시해줘': '🏭 생산 지시를 생성하겠습니다.\n어떤 제품을 몇 개 생산할까요?\n(예: 김치찌개 100개)',
        '위생점검 해줘': '🛡️ 위생점검 체크리스트:\n✅ 작업장 소독 완료\n✅ 개인 위생 점검 완료\n✅ 냉장고 온도 기록 완료\n✅ 유통기한 확인 완료\n모든 항목이 정상입니다.',
        '주문서 발행해줘': '📋 자동으로 주문서를 생성합니다.\n거래처를 선택하고 수량을 입력해주세요.',
        '온도 기록해줘': '🌡️ 온도 기록 준비 완료.\n측정할 온도를 입력해주세요.',
        'HACCP 보고서 필요해': '📄 HACCP 보고서 자동 생성 중...\n월간 위생 관리 현황을 포함한 보고서가 준비됩니다.'
    };

    // Check for exact matches first
    if (responses[message]) {
        return responses[message];
    }

    // Check for partial matches
    for (const [key, response] of Object.entries(responses)) {
        if (message.includes(key) || key.includes(message)) {
            return response;
        }
    }

    // Default response
    return `이해했습니다! "${message}" 작업을 처리하겠습니다.\n잠시만 기다려주세요...`;
}

function quickCommand(command) {
    document.getElementById('chatInput').value = command;
    sendChatMessage();
}

// Business Analytics Functions
async function analyzeSales() {
    const period = document.getElementById('analysisPeriod').value;
    const button = event.target;
    const resultDiv = document.getElementById('salesResult');
    const contentDiv = document.getElementById('salesContent');

    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';

    // Simulate AI processing
    await simulateAIProcessing();

    // Generate mock analysis
    const periodData = {
        daily: { sales: '5,000,000원', orders: 120, avgOrder: '41,666원' },
        weekly: { sales: '35,000,000원', orders: 840, avgOrder: '41,666원' },
        monthly: { sales: '150,000,000원', orders: 3600, avgOrder: '41,666원' }
    };

    const data = periodData[period];

    contentDiv.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="font-medium">총매출:</span>
                <span class="text-green-600 font-semibold">${data.sales}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium">주문 건수:</span>
                <span>${data.orders}건</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium">평균 객단가:</span>
                <span>${data.avgOrder}</span>
            </div>
            <div class="border-t pt-2 mt-2">
                <p class="text-sm"><strong>상품별 매출:</strong></p>
                ${state.salesData.products.map(product =>
                    `<div class="flex justify-between text-xs">
                        <span>${product.name}:</span>
                        <span>${(product.sales/10000).toFixed(0)}만원 (${product.percentage}%)</span>
                    </div>`
                ).join('')}
            </div>
            <div class="border-t pt-2 mt-2">
                <div class="flex justify-between">
                    <span class="font-medium">예상원가율:</span>
                    <span>36%</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-medium text-green-600">예상순이익:</span>
                    <span class="text-green-600 font-semibold">${(parseInt(data.sales.replace(/[^0-9]/g, '')) * 0.38).toLocaleString()}원</span>
                </div>
            </div>
        </div>
    `;

    resultDiv.classList.remove('hidden');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-chart-bar mr-2"></i>매출 분석 실행';

    showNotification('매출 분석이 완료되었습니다!', 'success');
}

// Inventory Management Functions
async function checkInventory() {
    const statusDiv = document.getElementById('inventoryStatus');
    const button = event.target;

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>확인 중...';

    await simulateAIProcessing();

    let inventoryHTML = '<div class="space-y-2">';

    for (const [item, data] of Object.entries(state.inventoryData)) {
        const percentage = (data.current / data.safe * 100).toFixed(0);
        const status = percentage < 50 ? '🔴' : percentage < 80 ? '🟡' : '🟢';

        inventoryHTML += `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="text-sm font-medium">${item}</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs">${data.current}/${data.safe}${data.unit}</span>
                    <span class="text-xs">${percentage}%</span>
                    <span>${status}</span>
                </div>
            </div>
        `;
    }

    inventoryHTML += '</div>';
    statusDiv.innerHTML = inventoryHTML;

    button.disabled = false;
    button.innerHTML = '<i class="fas fa-sync mr-2"></i>재고 현황 확인';

    showNotification('재고 현황이 업데이트되었습니다!', 'success');
}

async function autoPurchase() {
    const button = event.target;

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>발주 중...';

    await simulateAIProcessing();

    // Find items that need restocking
    const needsRestock = [];
    for (const [item, data] of Object.entries(state.inventoryData)) {
        if (data.current < data.safe) {
            const needed = data.safe - data.current;
            const recommended = data.safe + (data.safe * 0.5); // Add 50% buffer
            needsRestock.push({ item, needed, recommended });
        }
    }

    if (needsRestock.length === 0) {
        showNotification('발주가 필요한 품목이 없습니다.', 'info');
    } else {
        let purchaseMessage = '🛒 자동 발주 목록:\n\n';
        needsRestock.forEach(item => {
            purchaseMessage += `• ${item.item}: ${item.recommended}${state.inventoryData[item.item].unit}\n`;
        });
        purchaseMessage += '\n발주를 실행하시겠습니까?';

        if (confirm(purchaseMessage)) {
            // Update inventory (simulate purchase)
            needsRestock.forEach(item => {
                state.inventoryData[item.item].current += item.recommended;
            });

            showNotification(`${needsRestock.length}개 품목의 발주가 완료되었습니다!`, 'success');
            checkInventory(); // Refresh display
        }
    }

    button.disabled = false;
    button.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i>자동 발주 실행';
}

// Production Management Functions
async function createProductionOrder() {
    const orderInput = document.getElementById('productionOrder').value.trim();
    const button = event.target;
    const resultDiv = document.getElementById('productionResult');
    const contentDiv = document.getElementById('productionContent');

    if (!orderInput) {
        showNotification('생산 지시를 입력해주세요.', 'warning');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>생성 중...';

    await simulateAIProcessing();

    // Parse production order
    const match = orderInput.match(/(.+)\s+(\d+)개/);
    if (!match) {
        showNotification('올바른 형식으로 입력해주세요. (예: 김치찌개 100개)', 'warning');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-play mr-2"></i>생산 지시 생성';
        return;
    }

    const [, product, quantity] = match;

    // Generate BOM and production details
    const bomData = generateBOM(product, parseInt(quantity));

    contentDiv.innerHTML = `
        <div class="space-y-3">
            <div class="border-l-4 border-purple-500 pl-3">
                <h5 class="font-semibold text-purple-900">생산 지시 #${Date.now()}</h5>
                <p class="text-sm text-gray-700">${product} ${quantity}개</p>
            </div>

            <div>
                <h6 class="font-medium text-gray-900 mb-1">📋 BOM (원단위)</h6>
                ${bomData.ingredients.map(ing =>
                    `<div class="flex justify-between text-sm">
                        <span>${ing.name}:</span>
                        <span>${ing.quantity}${ing.unit}</span>
                    </div>`
                ).join('')}
            </div>

            <div>
                <h6 class="font-medium text-gray-900 mb-1">⏱️ 예상 소요시간</h6>
                <p class="text-sm text-gray-700">${bomData.time}</p>
            </div>

            <div>
                <h6 class="font-medium text-gray-900 mb-1">👥 담당자 배정</h6>
                <p class="text-sm text-gray-700">${bomData.assignee}</p>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded p-2">
                <p class="text-xs text-purple-700">✅ 생산 지시가 생성되었습니다. 원료 자동 불출 처리됩니다.</p>
            </div>
        </div>
    `;

    resultDiv.classList.remove('hidden');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-play mr-2"></i>생산 지시 생성';

    showNotification(`${product} ${quantity}개 생산 지시가 생성되었습니다!`, 'success');

    // Clear input
    document.getElementById('productionOrder').value = '';
}

function generateBOM(product, quantity) {
    const bomTemplates = {
        '김치찌개': {
            ingredients: [
                { name: '배추김치', quantity: (quantity * 0.2).toFixed(1), unit: 'kg' },
                { name: '두부', quantity: (quantity * 0.05).toFixed(1), unit: 'kg' },
                { name: '파', quantity: (quantity * 0.02).toFixed(1), unit: 'kg' },
                { name: '고춧가루', quantity: (quantity * 0.01).toFixed(1), unit: 'kg' }
            ],
            time: '약 2시간',
            assignee: '김OO 담당자'
        },
        '된장찌개': {
            ingredients: [
                { name: '된장', quantity: (quantity * 0.15).toFixed(1), unit: 'kg' },
                { name: '애호박', quantity: (quantity * 0.1).toFixed(1), unit: 'kg' },
                { name: '양파', quantity: (quantity * 0.08).toFixed(1), unit: 'kg' },
                { name: '멸치', quantity: (quantity * 0.03).toFixed(1), unit: 'kg' }
            ],
            time: '약 1.5시간',
            assignee: '이OO 담당자'
        },
        '순대': {
            ingredients: [
                { name: '순대', quantity: (quantity * 0.3).toFixed(1), unit: 'kg' },
                { name: '당면', quantity: (quantity * 0.05).toFixed(1), unit: 'kg' },
                { name: '야채', quantity: (quantity * 0.1).toFixed(1), unit: 'kg' },
                { name: '소스', quantity: (quantity * 0.02).toFixed(1), unit: 'L' }
            ],
            time: '약 1시간',
            assignee: '박OO 담당자'
        }
    };

    return bomTemplates[product] || bomTemplates['김치찌개'];
}

// HACCP and Quality Control Functions
async function recordTemperature() {
    const tempInput = document.getElementById('temperature');
    const temperature = parseFloat(tempInput.value);

    if (!temperature || isNaN(temperature)) {
        showNotification('온도를 입력해주세요.', 'warning');
        return;
    }

    await simulateAIProcessing();

    const status = temperature >= 0 && temperature <= 10 ? '✅ 정상' : '⚠️ 이상';
    const message = `온도 기록: ${temperature}°C ${status}\n시간: ${new Date().toLocaleTimeString()}`;

    addChatMessage(message, 'ai');
    showNotification('온도가 기록되었습니다.', 'success');

    tempInput.value = '';
}

async function healthCheck() {
    await simulateAIProcessing();

    const checks = [
        '✅ 작업장 소독 상태: 양호',
        '✅ 개인 위생 상태: 양호',
        '✅ 방역제 농도: 적정',
        '✅ 폐기물 처리: 정상',
        '✅ 해충 방지: 완료'
    ];

    const message = '🛡️ 위생점검 결과:\n' + checks.join('\n') + '\n\n모든 항목이 정상입니다.';

    addChatMessage(message, 'ai');
    showNotification('위생점검이 완료되었습니다.', 'success');
}

async function generateHACCPReport() {
    const button = event.target;

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>생성 중...';

    await simulateAIProcessing();

    const reportData = {
        date: new Date().toLocaleDateString(),
        inspector: 'AI 경리봇',
        checks: [
            { item: '선행요건관리(PPR)', status: '양호', details: '12개 항목 모두 준수' },
            { item: '중요관리점(CCP)', status: '양호', details: '가열, 냉각 온도 정상' },
            { item: '원료검수', status: '양호', details: '모든 원료 유통기한 확인' },
            { item: '제조공정', status: '양호', details: '표준작업절차 준수' },
            { item: '보관/운송', status: '양호', details: '온도 관리 완벽' }
        ]
    };

    let reportHTML = `
        <div class="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">HACCP 일일 점검 보고서</h2>
                <p class="text-gray-600">생성일: ${reportData.date}</p>
                <p class="text-gray-600">검사자: ${reportData.inspector}</p>
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 text-left">점검항목</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">상태</th>
                        <th class="border border-gray-300 px-4 py-2 text-left">세부사항</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.checks.map(check => `
                        <tr>
                            <td class="border border-gray-300 px-4 py-2">${check.item}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded">${check.status}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">${check.details}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="mt-6 text-center">
                <p class="text-lg font-semibold text-green-600">✅ 모든 항목 적합</p>
                <p class="text-gray-600">정부 제출용 보고서로 사용 가능</p>
            </div>
        </div>
    `;

    // Open in new window
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    reportWindow.document.write(`
        <html>
            <head>
                <title>HACCP 보고서</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .text-center { text-align: center; }
                    .text-green-600 { color: #16a34a; }
                </style>
            </head>
            <body>
                ${reportHTML}
                <div class="text-center mt-4">
                    <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded">인쇄</button>
                </div>
            </body>
        </html>
    `);

    button.disabled = false;
    button.innerHTML = '<i class="fas fa-file-medical mr-2"></i>HACCP 보고서 생성';

    showNotification('HACCP 보고서가 생성되었습니다!', 'success');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeTextarea = document.activeElement;
        if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
            if (activeTextarea.id === 'commitInput') {
                generateCommitMessage();
            } else if (activeTextarea.id === 'beforeCode' || activeTextarea.id === 'afterCode') {
                explainChanges();
            }
        }
    }

    // Ctrl/Cmd + K to clear all inputs
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearAllInputs();
    }
});

function clearAllInputs() {
    document.getElementById('commitInput').value = '';
    document.getElementById('commitContext').value = '';
    document.getElementById('beforeCode').value = '';
    document.getElementById('afterCode').value = '';
    document.getElementById('commitResult').classList.add('hidden');
    document.getElementById('explanationResult').classList.add('hidden');

    showNotification('모든 입력이 초기화되었습니다.', 'info');
}