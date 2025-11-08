// AI CLI Web Interface JavaScript

// State Management
const state = {
    isDarkMode: false,
    currentLanguage: 'ko',
    aiModel: 'gpt-4'
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