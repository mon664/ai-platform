'use client';

import { useState } from 'react';
import { ActionSelect } from './ActionSelect';
import { VendorSelect } from './VendorSelect';
import { ProductSelect } from './ProductSelect';
import { NumberInput } from './NumberInput';

interface OrderConfirmCardProps {
  onSubmit: (orderData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function OrderConfirmCard({ onSubmit, onCancel, loading = false }: OrderConfirmCardProps) {
  const [action, setAction] = useState('');
  const [vendor, setVendor] = useState({ code: '', name: '' });
  const [product, setProduct] = useState({ code: '', name: '', price: 0 });
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const actionLabels = {
    '1': '구매',
    '2': '판매',
    '3': '생산입고',
    '4': '재고',
    '5': '기타'
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    // 액션 변경 시 기존 데이터 초기화
    setVendor({ code: '', name: '' });
  };

  const handleVendorChange = (code: string, name: string) => {
    setVendor({ code, name });
  };

  const handleProductChange = (code: string, name: string, price: number) => {
    setProduct({ code, name, price });
    setUnitPrice(price); // 품목 선택 시 단가 자동 설정
  };

  const handleSubmit = () => {
    const orderData = {
      action: actionLabels[action as keyof typeof actionLabels] || action,
      vendor: vendor.name,
      vendorCode: vendor.code,
      product: product.name,
      productCode: product.code,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      warehouse: '00003' // 기본 창고
    };

    onSubmit(orderData);
  };

  const isFormValid = () => {
    return action && vendor.code && product.code && quantity > 0 && unitPrice > 0;
  };

  const getTotalPrice = () => {
    return quantity * unitPrice;
  };

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '2px solid #374151',
      borderRadius: '12px',
      padding: '24px',
      margin: '16px 0',
      width: '100%',
      maxWidth: '500px',
      position: 'relative'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #374151'
      }}>
        <span style={{ fontSize: '24px', marginRight: '12px' }}>📋</span>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'white' }}>
            주문 확인
          </h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            모든 정보를 입력하고 확인해주세요
          </p>
        </div>
      </div>

      {/* 액션 선택 */}
      <ActionSelect
        value={action}
        onChange={handleActionChange}
        disabled={loading}
      />

      {/* 거래처 선택 */}
      {(action === '1' || action === '2') && (
        <VendorSelect
          value={vendor.code}
          onChange={handleVendorChange}
          disabled={loading}
          placeholder={action === '1' ? '공급업체를 선택하세요' : '고객사를 선택하세요'}
        />
      )}

      {/* 품목 선택 */}
      <ProductSelect
        value={product.code}
        onChange={handleProductChange}
        disabled={loading}
      />

      {/* 수량 입력 */}
      <NumberInput
        value={quantity}
        onChange={setQuantity}
        disabled={loading}
        min={1}
        max={9999}
        label="수량"
        suffix="개"
      />

      {/* 단가 입력 */}
      <NumberInput
        value={unitPrice}
        onChange={setUnitPrice}
        disabled={loading}
        min={0}
        max={999999999}
        step={100}
        label="단가"
        suffix="원"
      />

      {/* 총액 표시 */}
      <div style={{
        backgroundColor: '#374151',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '16px', color: '#9ca3af' }}>총액</span>
        <span style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#10b981'
        }}>
          {getTotalPrice().toLocaleString()}원
        </span>
      </div>

      {/* 버튼 그룹 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isFormValid() && !loading ? '#10b981' : '#4b5563',
            color: 'white',
            fontWeight: 'bold',
            cursor: isFormValid() && !loading ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (isFormValid() && !loading) {
              e.currentTarget.style.backgroundColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (isFormValid() && !loading) {
              e.currentTarget.style.backgroundColor = '#10b981';
            }
          }}
        >
          {loading ? (
            <>
              <span>⏳</span>
              처리 중...
            </>
          ) : (
            <>
              <span>✅</span>
              확인
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            backgroundColor: 'transparent',
            color: '#ef4444',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ef4444';
            }
          }}
        >
          <span>❌</span>
          취소
        </button>
      </div>

      {/* 유효성 검사 메시지 */}
      {!isFormValid() && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#991b1b',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#fecaca'
        }}>
          ⚠️ 모든 필드를 올바르게 입력해주세요
        </div>
      )}
    </div>
  );
}