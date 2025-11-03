import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, confirmed } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'message가 없습니다.' },
        { status: 400 }
      );
    }

    console.log('Chat API 호출 시작:', { messageLength: message.length, confirmed });

    let aiResponse;
    let provider = '';

    // STEP 1: 확인된 데이터가 있으면 바로 사용
    if (confirmed) {
      try {
        aiResponse = JSON.parse(message);
        provider = '사용자 확인 데이터';
        console.log('✅ 확인된 데이터 사용:', { action: aiResponse.action });
      } catch (parseError) {
        console.error('❌ 확인된 데이터 파싱 실패:', parseError);
        return NextResponse.json(
          { error: '데이터 형식 오류' },
          { status: 400 }
        );
      }
    } else {
      // STEP 2: AI 제공업체 Fallback 시도 (비용 효율적 순서)

      // Gemini (가장 저렴, 주 엔진)
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log('Gemini (주 엔진) 시도 중...');
          aiResponse = await callGemini(message);
          provider = 'Gemini (저비용)';
          console.log('✅ Gemini 응답 성공:', { action: aiResponse.action });
        } catch (geminiError) {
          console.error('❌ Gemini 실패:', geminiError);
        }
      }

      // ChatGPT (필요시만)
      if (!aiResponse && process.env.OPENAI_API_KEY) {
        try {
          console.log('ChatGPT (2차) 시도 중...');
          aiResponse = await callChatGPT(message);
          provider = 'ChatGPT';
          console.log('✅ ChatGPT 응답 성공:', { action: aiResponse.action });
        } catch (gptError) {
          console.error('❌ ChatGPT 실패:', gptError);
        }
      }

      // GLM (충전 후 복구 시)
      if (!aiResponse && process.env.GLM_API_KEY) {
        try {
          console.log('GLM 4.6 (3차) 시도 중...');
          aiResponse = await callGLM(message);
          provider = 'GLM 4.6';
          console.log('✅ GLM 응답 성공:', { action: aiResponse.action });
        } catch (glmError) {
          console.error('❌ GLM 실패:', glmError);
        }
      }

      // 모든 AI 실패 시 모의 응답
      if (!aiResponse) {
        console.log('⚠️ 모든 AI 실패 - 모의 응답 반환');
        aiResponse = {
          action: 'sale',
          data: {
            customer: '테스트고객',
            product: '테스트상품',
            product_code: '000016', // 품목코드 추가
            qty: 1,
            price: 10000,
            date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            warehouse: '00003' // 출하창고 추가
          }
        };
        provider = '모의 응답 (개발용)';
      }
    }

    // STEP 2: 이카운트 API 호출
    const ecountResult = await callEcountAPI(aiResponse);

    // STEP 3: 결과 반환
    return NextResponse.json({
      response: `✅ ${provider} - ${aiResponse.action} 완료\n${JSON.stringify(ecountResult, null, 2)}`
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// GLM 4.6 호출 (최소 토큰)
async function callGLM(message: string) {
  const glmApiKey = process.env.GLM_API_KEY;

  const prompt = `
다음 명령을 JSON으로 변환:
입력: "${message}"

규칙:
- sale: 판매
- purchase: 구매
- production_receipt: 생산입고

JSON 형식 (반드시 PROD_CD, PROD_DES, QTY 필수 포함):
{"action":"...","data":{"vendor/customer":"","product":"","product_code":"","qty":0,"price":0,"date":"20251103","warehouse":""}}

중요: 이카운트 API 요구사항
- PROD_CD (품목코드)는 반드시 유효한 6자리 숫자여야 함
- PROD_DES (품목명)은 반드시 포함해야 함
- QTY (수량)는 0보다 큰 정수여야 함
- 모든 필수 필드가 누락되면 API가 거절함

품목코드 예시: 000016(소불고기), 000017(돈까스), 000018(치킨)
창고 예시: 00003(본사창고), 00004(본사생산공장)

JSON만 반환하세요:
`;

  console.log('GLM API 요청:', { promptLength: prompt.length });

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${glmApiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  console.log('GLM API 응답 상태:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('GLM API Error:', errorData);
    throw new Error(`GLM API failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('GLM API 성공:', { responseLength: JSON.stringify(data).length });

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('GLM API 응답 형식 오류');
  }

  const text = data.choices[0].message.content;
  console.log('GLM 응답 텍스트:', text);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('GLM 응답에서 JSON을 찾을 수 없음');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('JSON 파싱 오류:', jsonMatch[0]);
    throw new Error('GLM 응답 JSON 파싱 실패');
  }
}

// ChatGPT 호출
async function callChatGPT(message: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const prompt = `
다음 명령을 JSON으로 변환:
입력: "${message}"

규칙:
- sale: 판매
- purchase: 구매
- production_receipt: 생산입고

JSON 형식 (반드시 PROD_CD, PROD_DES, QTY 필수 포함):
{"action":"...","data":{"vendor/customer":"","product":"","product_code":"","qty":0,"price":0,"date":"20251103","warehouse":""}}

중요: 이카운트 API 요구사항
- PROD_CD (품목코드)는 반드시 유효한 6자리 숫자여야 함
- PROD_DES (품목명)은 반드시 포함해야 함
- QTY (수량)는 0보다 큰 정수여야 함
- 모든 필수 필드가 누락되면 API가 거절함

품목코드 예시: 000016(소불고기), 000017(돈까스), 000018(치킨)
창고 예시: 00003(본사창고), 00004(본사생산공장)

JSON만 반환하세요:
`;

  console.log('ChatGPT API 요청:', { promptLength: prompt.length });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('ChatGPT API Error:', errorData);
    throw new Error(`ChatGPT API failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('ChatGPT 응답에서 JSON을 찾을 수 없음');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    throw new Error('ChatGPT 응답 JSON 파싱 실패');
  }
}

// Gemini 호출
async function callGemini(message: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const prompt = `
다음 명령을 JSON으로 변환:
입력: "${message}"

규칙:
- sale: 판매
- purchase: 구매
- production_receipt: 생산입고

JSON 형식 (반드시 PROD_CD, PROD_DES, QTY 필수 포함):
{"action":"...","data":{"vendor/customer":"","product":"","product_code":"","qty":0,"price":0,"date":"20251103","warehouse":""}}

중요: 이카운트 API 요구사항
- PROD_CD (품목코드)는 반드시 유효한 6자리 숫자여야 함
- PROD_DES (품목명)은 반드시 포함해야 함
- QTY (수량)는 0보다 큰 정수여야 함
- 모든 필수 필드가 누락되면 API가 거절함

품목코드 예시: 000016(소불고기), 000017(돈까스), 000018(치킨)
창고 예시: 00003(본사창고), 00004(본사생산공장)

JSON만 반환하세요:
`;

  console.log('Gemini API 요청:', { promptLength: prompt.length });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Gemini API Error:', errorData);
    throw new Error(`Gemini API failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gemini 응답에서 JSON을 찾을 수 없음');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    throw new Error('Gemini 응답 JSON 파싱 실패');
  }
}

// 이카운트 API 호출
async function callEcountAPI(glmData: any) {
  const sessionId = process.env.ECOUNT_SESSION_ID;
  const zone = process.env.ECOUNT_ZONE || 'BB';

  // 필수 필드 검증 및 기본값 설정
  const validateAndFixData = (data: any) => {
    const fixed = { ...data };
    
    // 1. 품목명 (PROD_DES) - 필수
    if (!fixed.product || fixed.product.trim() === '') {
      throw new Error('❌ 품목명이 없습니다');
    }
    
    // 2. 수량 (QTY) - 필수
    if (!fixed.qty || fixed.qty <= 0) {
      throw new Error('❌ 수량이 없거나 0 이하입니다');
    }
    fixed.qty = parseInt(fixed.qty);
    
    // 3. 단가 (PRICE) - 필수
    if (!fixed.price || fixed.price <= 0) {
      throw new Error('❌ 단가가 없거나 0 이하입니다');
    }
    fixed.price = parseInt(fixed.price);
    
    // 4. 거래처 (CUST_DES) - 필수
    if (!fixed.customer && !fixed.vendor) {
      throw new Error('❌ 거래처 정보가 없습니다');
    }
    
    // 5. 날짜 (IO_DATE) - 필수, YYYYMMDD 형식
    if (!fixed.date) {
      fixed.date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    } else if (fixed.date.includes('-')) {
      fixed.date = fixed.date.replace(/-/g, '');
    }
    
    // 6. 품목코드 (PROD_CD) - 없으면 공백 (API가 품목명으로 매칭)
    if (!fixed.product_code || fixed.product_code.trim() === '') {
      fixed.product_code = '';
    }
    
    // 7. 창고 (WH_CD) - 없으면 기본값
    if (!fixed.warehouse) {
      fixed.warehouse = '00003';
    }
    
    return fixed;
  };

  try {
    const fixedData = validateAndFixData(glmData.data);

    if (glmData.action === 'sale') {
      return fetch(
        `https://sboapi${zone}.ecount.com/OAPI/V2/Sale/SaveSale?SESSION_ID=${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            SaleList: [{
              BulkDatas: {
                SO_DATE: fixedData.date,
                CUST_DES: fixedData.customer || fixedData.vendor,
                WH_CD: fixedData.warehouse,
                SaleDetail: [{
                  PROD_CD: fixedData.product_code,
                  PROD_DES: fixedData.product,
                  QTY: fixedData.qty,
                  PRICE: fixedData.price
                }]
              }
            }]
          })
        }
      ).then(r => r.json());
    }

    if (glmData.action === 'purchase') {
      return fetch(
        `https://sboapi${zone}.ecount.com/OAPI/V2/Purchases/SavePurchases?SESSION_ID=${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            PurchasesList: [{
              BulkDatas: {
                IO_DATE: fixedData.date,
                CUST_DES: fixedData.vendor || fixedData.customer,
                UPLOAD_SER_NO: "1",
                WH_CD: "00001",
                PurchaseDetail: [{
                  PROD_CD: fixedData.product_code,
                  PROD_DES: fixedData.product,
                  QTY: fixedData.qty,
                  PRICE: fixedData.price
                }]
              }
            }]
          })
        }
      ).then(r => r.json());
    }

    if (glmData.action === 'production_receipt') {
      return fetch(
        `https://sboapi${zone}.ecount.com/OAPI/V2/GoodsReceipt/SaveGoodsReceipt?SESSION_ID=${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            GoodsReceiptList: [{
              BulkDatas: {
                PROD_DES: fixedData.product,
                PROD_CD: fixedData.product_code,
                QTY: fixedData.qty,
                IO_DATE: fixedData.date,
                WH_CD_F: "00004",
                WH_CD_T: "00003"
              }
            }]
          })
        }
      ).then(r => r.json());
    }

    return { error: 'Unknown action' };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}