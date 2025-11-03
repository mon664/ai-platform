'use client';

import { useState, useEffect, useRef } from 'react';
import {
  validateRequiredFields,
  findVendor,
  findProduct,
  findWarehouse,
  extractEntitiesFromText,
  generateMissingInfoQuestions,
  type Vendor,
  type Product,
  type Warehouse
} from '@/lib/validators';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
}

interface BusinessTransaction {
  action: 'sale' | 'purchase' | 'production_receipt';
  customer?: string;
  vendor?: string;
  product: string;
  product_code?: string;
  qty: number;
  price: number;
  date: string;
  warehouse?: string;
  [key: string]: any;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 🤖 AI 스마트 팩토리 에이전트입니다.\n\n무엇을 도와드릴까요?\n• 판매 등록 (예: "삼성전자에 갤럭시 팔아줘")\n• 구매 등록 (예: "LG디스플레이에서 OLED 패널 사줘")\n• 생산 입고 (예: "갤럭시 50개 생산 완료")'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<BusinessTransaction | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadData = async () => {
    try {
      const [vendorsRes, productsRes, warehousesRes] = await Promise.all([
        fetch('/api/data/vendors'),
        fetch('/api/data/products'),
        fetch('/api/data/warehouses')
      ]);

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData.vendors || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json();
        setWarehouses(warehousesData.warehouses || []);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    }
  };

  const analyzeCommand = (message: string): { transaction: BusinessTransaction | null, validation: any } => {
    const lowerMessage = message.toLowerCase();

    // 액션 판별
    let action: 'sale' | 'purchase' | 'production_receipt';
    if (lowerMessage.includes('팔아') || lowerMessage.includes('판매') || lowerMessage.includes('출하')) {
      action = 'sale';
    } else if (lowerMessage.includes('사') || lowerMessage.includes('구매') || lowerMessage.includes('입고')) {
      action = 'purchase';
    } else if (lowerMessage.includes('생산') || lowerMessage.includes('완료')) {
      action = 'production_receipt';
    } else {
      return { transaction: null, validation: null };
    }

    // 엔티티 추출
    const entities = extractEntitiesFromText(message, vendors, products);

    // 기본값 설정
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const defaultWarehouse = '00003'; // 본사창고

    // 거래처 정보 설정
    let customer: string | undefined;
    if (action === 'sale' && entities.vendor) {
      customer = entities.vendor.name;
    }

    // 품목 정보 설정
    let product: string;
    let product_code: string | undefined;
    let price: number;

    if (entities.product) {
      product = entities.product.name;
      product_code = entities.product.code;
      price = parseInt(entities.product.price) || 10000;
    } else {
      // 품목명 추출 시도
      const productMatch = message.match(/[가-힣]+[\s]*[\w]*[\s]*[\w]*/);
      product = productMatch ? productMatch[0] : '알 수 없는 품목';
      price = 10000;
    }

    const transaction: BusinessTransaction = {
      action,
      customer,
      product,
      product_code,
      qty: entities.quantity || 1,
      price: entities.price || price,
      date: today,
      warehouse: action === 'production_receipt' ? '00003' : undefined
    };

    // 유효성 검사
    const validation = validateRequiredFields(transaction, action);

    return { transaction, validation };
  };

  const createConfirmationMessage = (transaction: BusinessTransaction, validation: any): string => {
    const actionText = transaction.action === 'sale' ? '판매' :
                      transaction.action === 'purchase' ? '구매' : '생산입고';

    let message = `📋 ${actionText} 등록 확인\n\n`;
    message += `품목: ${transaction.product}\n`;
    message += `수량: ${transaction.qty}개\n`;
    message += `단가: ${transaction.price.toLocaleString()}원\n`;

    if (transaction.customer) {
      message += `거래처: ${transaction.customer}\n`;
    }

    if (transaction.product_code) {
      message += `품목코드: ${transaction.product_code}\n`;
    }

    if (transaction.warehouse) {
      message += `창고: ${warehouses.find(w => w.code === transaction.warehouse)?.name || transaction.warehouse}\n`;
    }

    message += `날짜: ${transaction.date}\n\n`;

    // 경고 메시지 추가
    if (validation.warnings.length > 0) {
      message += `⚠️ 경고:\n`;
      validation.warnings.forEach((warning: string) => {
        message += `• ${warning}\n`;
      });
      message += `\n`;
    }

    // 누락된 필드 안내
    if (!validation.isValid) {
      message += `❌ 다음 정보가 필요합니다:\n`;
      validation.missing.forEach((field: string) => {
        let fieldName = field;
        switch (field) {
          case 'customer': fieldName = '거래처'; break;
          case 'vendor': fieldName = '공급업체'; break;
          case 'product_code': fieldName = '품목코드'; break;
          case 'qty': fieldName = '수량'; break;
          case 'price': fieldName = '단가'; break;
          case 'warehouse': fieldName = '창고'; break;
        }
        message += `• ${fieldName}\n`;
      });
      message += `\n`;
    }

    // 개선 제안
    if (validation.suggestions.length > 0) {
      message += `💡 제안:\n`;
      validation.suggestions.forEach((suggestion: string) => {
        message += `• ${suggestion}\n`;
      });
      message += `\n`;
    }

    if (validation.isValid) {
      message += `✅ 모든 정보가 확인되었습니다. 이대로 등록하시겠습니까? (예/아니오)`;
    } else {
      message += `❌ 정보가 부족하여 등록할 수 없습니다. 누락된 정보를 추가로 입력해주세요.`;
    }

    return message;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      if (awaitingConfirmation && currentTransaction) {
        // 확인 단계 처리
        if (userMessage.toLowerCase().includes('예') || userMessage.toLowerCase().includes('네') || userMessage.toLowerCase().includes('yes')) {
          // 실제 이카운트 API 호출
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: JSON.stringify(currentTransaction),
              confirmed: true
            })
          });

          const result = await response.json();
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ 처리 완료!\n\n${result.response}`,
            data: result
          }]);
        } else {
          // 취소
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ 처리가 취소되었습니다.\n\n다른 거래를 도와드릴까요?'
          }]);
        }

        setAwaitingConfirmation(false);
        setCurrentTransaction(null);
      } else {
        // 명령어 분석 단계
        const result = analyzeCommand(userMessage);

        if (!result.transaction) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '죄송합니다. 명령을 이해할 수 없습니다.\n\n아래 예시를 참고해주세요:\n• "삼성전자에 갤럭시 10대 팔아줘"\n• "LG디스플레이에서 OLED 패널 100개 사줘"\n• "갤럭시 50개 생산 완료"'
          }]);
        } else {
          const { transaction, validation } = result;

          if (!validation.isValid) {
            // 정보 부족 시 추가 정보 요청
            const questions = generateMissingInfoQuestions(validation.missing, transaction.action, transaction);
            let message = '📋 정보 추가가 필요합니다.\n\n';

            if (questions.length > 0) {
              message += '다음 정보를 알려주세요:\n';
              questions.forEach((q, idx) => {
                message += `${idx + 1}. ${q}\n`;
              });
            }

            message += '\n현재까지 파악된 정보:\n';
            message += `• 액션: ${transaction.action === 'sale' ? '판매' : transaction.action === 'purchase' ? '구매' : '생산입고'}\n`;
            message += `• 품목: ${transaction.product}\n`;
            if (transaction.customer) message += `• 거래처: ${transaction.customer}\n`;
            if (transaction.qty) message += `• 수량: ${transaction.qty}개\n`;
            if (transaction.price) message += `• 단가: ${transaction.price.toLocaleString()}원\n`;

            setMessages(prev => [...prev, {
              role: 'assistant',
              content: message
            }]);

            // 현재 트랜잭션을 유지하여 추가 정보 수집 대기
            setCurrentTransaction(transaction);
            setAwaitingConfirmation(false);
          } else {
            // 유효성 검사 통과 시 확인 요청
            setCurrentTransaction(transaction);
            setAwaitingConfirmation(true);

            const confirmationMessage = createConfirmationMessage(transaction, validation);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: confirmationMessage
            }]);
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '오류 발생: ' + (error as Error).message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '16px 24px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>🤖</span>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>AI 스마트 팩토리 챗봇</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            {vendors.length}거래처, {products.length}품목, {warehouses.length}창고 연동됨
          </p>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#111827',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: '16px',
            textAlign: msg.role === 'user' ? 'right' : 'left',
            maxWidth: '100%'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? '#2563eb' : '#374151',
              color: msg.role === 'user' ? 'white' : '#f3f4f6',
              maxWidth: '80%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
            {msg.data && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#065f46',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#86efac',
                maxWidth: '80%',
                display: 'inline-block'
              }}>
                📊 시스템 응답 수신됨
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '16px',
        borderTop: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={awaitingConfirmation ? "확인 (예/아니오)" : "명령을 입력하세요..."}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #4b5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading || !input.trim() ? '#4b5563' : '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '처리 중...' : '전송'}
          </button>
        </div>

        {/* 상태 표시 */}
        {awaitingConfirmation && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#065f46',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#86efac'
          }}>
            ⏳ 확인을 기다리는 중입니다...
          </div>
        )}
      </div>
    </div>
  );
}