import PurchaseUploader from "@/app/components/ecount/PurchaseUploader";

export default function PurchasePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '32px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: '#4ade80' }}>
            🏭 AI 경리 봇 - 구매 관리
          </h1>
          <p style={{ color: '#9ca3af' }}>
            거래명세서를 업로드하면 3단계 AI 프로세스로 자동 처리됩니다
          </p>
        </div>

        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#86efac' }}>
              📋 거래명세서 자동 등록
            </h2>
            <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fde047' }}>
                🔄 3단계 AI 처리 프로세스
              </h3>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#60a5fa' }}>1.</span>
                  <div>
                    <strong>Vision AI (Claude)</strong>: 이미지에서 원본 데이터 추출
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#60a5fa' }}>2.</span>
                  <div>
                    <strong>GLM 4.6</strong>: Raw Data를 이카운트 API JSON으로 변환 (저비용)
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#60a5fa' }}>3.</span>
                  <div>
                    <strong>이카운트 ERP</strong>: 자동 전표 생성 및 등록
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <PurchaseUploader />
        </div>

        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#86efac' }}>
            💰 비용 효율성
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '14px' }}>
            <div style={{ backgroundColor: '#374151', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔍</div>
              <div style={{ fontWeight: '600' }}>STEP 1</div>
              <div style={{ color: '#9ca3af' }}>Claude Vision</div>
              <div style={{ color: '#4ade80' }}>$3/M tokens</div>
            </div>
            <div style={{ backgroundColor: '#374151', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚙️</div>
              <div style={{ fontWeight: '600' }}>STEP 2</div>
              <div style={{ color: '#9ca3af' }}>GLM 4.6</div>
              <div style={{ color: '#4ade80' }}>$0.5/M tokens</div>
            </div>
            <div style={{ backgroundColor: '#374151', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>📤</div>
              <div style={{ fontWeight: '600' }}>STEP 3</div>
              <div style={{ color: '#9ca3af' }}>이카운트 API</div>
              <div style={{ color: '#4ade80' }}>무료</div>
            </div>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
            월 100건 기준 약 $3.50 (한화 약 4,500원)
          </div>
        </div>
      </div>
    </div>
  );
}