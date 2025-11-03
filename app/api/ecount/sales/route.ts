import { NextRequest, NextResponse } from 'next/server';

// 판매 등록 API 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, productCode, quantity, price, customer, date, warehouse } = body;

    // 입력값 검증
    if (!product || !quantity || !price) {
      return NextResponse.json({
        success: false,
        error: '필수 필드 누락: 품목명, 수량, 단가'
      }, { status: 400 });
    }

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: '거래처가 없습니다'
      }, { status: 400 });
    }

    // 이카운트 API 형식으로 데이터 변환
    const salesData = {
      SalesList: [{
        BulkDatas: {
          SO_DATE: date ? date.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, ''),
          UPLOAD_SER_NO: "1",
          CUST: "",
          CUST_DES: customer,
          WH_CD: warehouse || "00001",
          TTL_CTT: "판매 전표",
          U_MEMO1: "",
          SalesDetails: [
            {
              PROD_CD: productCode || "",
              PROD_DES: product,
              QTY: parseInt(quantity),
              PRICE: parseInt(price),
              UNIT: "개"
            }
          ]
        }
      }]
    };

    // 이카운트 API에 전송
    const ecountApiKey = process.env.ECOUNT_API_KEY;
    const ecountUrl = process.env.ECOUNT_API_URL;

    if (!ecountApiKey || !ecountUrl) {
      return NextResponse.json({
        success: false,
        error: '이카운트 API 설정이 없습니다'
      }, { status: 500 });
    }

    const ecountResponse = await fetch(`${ecountUrl}/Sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ecountApiKey}`
      },
      body: JSON.stringify(salesData)
    });

    const ecountResult = await ecountResponse.json();

    if (!ecountResponse.ok) {
      console.error('이카운트 API 오류:', ecountResult);
      return NextResponse.json({
        success: false,
        error: '이카운트 API 오류',
        details: ecountResult
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `✅ 판매 등록 완료!\n품목: ${product}\n수량: ${quantity}개\n거래처: ${customer}`,
      data: ecountResult
    });

  } catch (error) {
    console.error('판매 등록 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류',
      details: (error as Error).message
    }, { status: 500 });
  }
}
