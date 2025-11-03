'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: '#4ade80' }}>
            🏭 AI 스마트 팩토리 ERP
          </h1>
          <p style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '32px' }}>
            AI 기반 통합 생산 관리 시스템 - 이카운트 연동 완료
          </p>
        </div>

        {/* ERP 메뉴 카테고리 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '48px' }}>

          {/* AI 채팅 카테고리 */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid #374151' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🤖</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>AI 자동화</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/chat"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#60a5fa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>💬</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>AI 채팅</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>자연어 비즈니스 처리</div>
                </div>
              </Link>
            </div>
          </div>

          {/* 구매/재고 관리 카테고리 */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid #374151' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🛒</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>구매/재고 관리</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/modules/purchase-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>📋</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>구매입력</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>실시간 거래처/품목 연동</div>
                </div>
              </Link>
              <Link
                href="/ecount/purchase"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>📸</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>이카운트 연동</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>3단계 AI 전표 처리</div>
                </div>
              </Link>
            </div>
          </div>

          {/* 생산 관리 카테고리 */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid #374151' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🏭</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>생산 관리</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/modules/production-log"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>📊</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>생산일지</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>실시간 현황 관리</div>
                </div>
              </Link>
              <Link
                href="/modules/bom"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>💰</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>BOM 관리</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>원가명세서 관리</div>
                </div>
              </Link>
            </div>
          </div>

          {/* 품질/위생 관리 카테고리 */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', border: '1px solid #374151' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🛡️</span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>품질/위생 관리</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/modules/haccp"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>🔬</span>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>HACCP 관리</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>식품안전 검사 기록</div>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* 시스템 상태 */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#86efac' }}>
            📊 시스템 현황
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>296</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>거래처</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>252</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>품목</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>6</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>창고</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>API 연동</div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p>🚀 Powered by ChatGPT AI + 이카운트 ERP 연동</p>
          <p style={{ marginTop: '8px' }}>⚡ 실시간 데이터 통합 | 🏭 스마트 팩토리 솔루션</p>
        </div>
      </div>
    </main>
  );
}