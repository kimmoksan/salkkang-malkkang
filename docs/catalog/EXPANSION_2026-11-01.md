# 카탈로그 추가 검증 — 2026-11-01

기존 24개를 변경하지 않고 판매 모델/구성 12개를 추가했다. 각 제품군 3개씩, 총 36개(제품군별 9개).

## 확인 범위

- 공식몰의 모델명·양수 가격·InStock 또는 주문 가능 variant를 대조했다. 구매 버튼만으로 판매 중을 판정하지 않았다.
- 로보락 S10 물통형/직배수형은 배관 설치 여부가 다른 별도 판매 구성으로 구분했다. 12개는 독립 본체 12종이라는 뜻이 아니다. 색상별로 중복 집계하지 않았다.
- DW80F75K1U39FF는 교체용 필터 포함 패키지의 정확한 판매 코드다. 본체 단품을 별도 추가하지 않았다.
- 삼성 일부 페이지에는 정보 확인 전용·재입고 버튼 등 공통 안내가 함께 있다. 판매 판정은 해당 SKU의 공식 구조화 데이터 InStock·양수 가격까지 확인한 범위다. 실제 결제나 배송지별 설치 가능 여부는 확인하지 않았다.
- 공식 상세 표를 확보하지 못한 삼성·로보락 치수는 미확인으로 남겼다. 상품명/공식 상품 설명에 없는 기능·에너지 등급을 추정하지 않았다.
- 소비전력·최대 흡입력·고온수 표기는 제조사 사양이며 실제 상시 전력·청소 성능·물걸레 접촉 온도를 보장하지 않는다.
- 코웨이 필터구성의 원문 표기(에어매칭필터0 등)는 임의 수정하지 않았다.
- 기존 제품 확인일은 2026-10-30을 유지한다. 추가 12개만 2026-11-01 기준이며 실시간 재고 보장은 아니다.
- 제외: DV90T5540BV는 공식 JSON-LD OutOfStock. 샤오미 X20 Max는 동적 페이지의 유효 판매 가격·재고를 확인하지 못해 제외.

## 제품별 근거

| 모델/판매 구성 | 공식 출처 | 확인한 내용 |
|---|---|---|
| DW99F79E1UHCS | [공식 페이지](https://www.samsung.com/sec/dishwashers/built-in-dw99f79e1uhcs-d2c/DW99F79E1UHCS/) | 공식 상품 JSON-LD: SKU 일치, InStock, 2,210,000원. 사양은 공식 상품명에 명시된 값만 채택. |
| DW90F79F1USWS | [공식 페이지](https://www.samsung.com/sec/dishwashers/built-in-dw90f79f1usws-d2c/DW90F79F1USWS/) | 공식 상품 JSON-LD: SKU 일치, InStock, 2,010,000원. 사양은 공식 상품명에 명시된 값만 채택. |
| DW80F75K1U39FF | [공식 페이지](https://www.samsung.com/sec/dishwashers/package-dw80f75k1u39ff-d2c/DW80F75K1U39FF/) | 공식 상품 JSON-LD: SKU 일치, InStock, 1,599,000원. 사양은 공식 상품명에 명시된 값만 채택. |
| DV90F22CDT | [공식 페이지](https://www.samsung.com/sec/dryers/dryer-dv90f22cdt-d2c/DV90F22CDT/) | 공식 상품 JSON-LD: SKU 일치, InStock, 2,299,000원. 사양은 공식 상품명에 명시된 값만 채택. |
| DV80H22DDW | [공식 페이지](https://www.samsung.com/sec/dryers/dryer-dv80h22ddw-d2c/DV80H22DDW/) | 공식 상품 JSON-LD: SKU 일치, InStock, 2,099,000원. 사양은 공식 상품명에 명시된 값만 채택. |
| S10 MaxV Ultra Steam | [공식 페이지](https://kr.roborock.com/products/로보락-s10-maxv-steam-로봇청소기) | 공식 Shopify 상품 데이터: product_id=15420390343022, 주문 가능 variant_id=67718581813614, available=true, 1,590,000원. 기능은 공식 body_html 표기. 모델 코드는 미제공으로 공식 판매명을 식별자로 사용. |
| S10 MaxV Ultra Steam 직배수 | [공식 페이지](https://kr.roborock.com/products/로보락-s10-maxv-ultra-steam) | 공식 Shopify 상품 데이터: product_id=15420508111214, 주문 가능 variant_id=67718588334446, available=true, 1,740,000원. 기능은 공식 body_html 표기. 모델 코드는 미제공으로 공식 판매명을 식별자로 사용. |
| Saros Z70 | [공식 페이지](https://kr.roborock.com/products/로보락-saros-z70-로봇청소기) | 공식 Shopify 상품 데이터: product_id=14729677013358, 주문 가능 variant_id=52141519438190, available=true, 2,090,000원. 기능은 공식 body_html 표기. 모델 코드는 미제공으로 공식 판매명을 식별자로 사용. |
| AP-1726J | [공식 페이지](https://www.coway.com/product/detail?prdno=1568) | 공식 ProductGroup의 모델 SKU와 InStock 확인. additionalProperty 사양 필드명을 그대로 보존. offers 가격은 월 렌탈료이므로 본체 가격으로 저장하지 않음. 공식 제품 목록의 일시불 구매·장바구니도 확인. |
| AP-2126I | [공식 페이지](https://www.coway.com/product/detail?prdno=1567) | 공식 ProductGroup의 모델 SKU와 InStock 확인. additionalProperty 사양 필드명을 그대로 보존. offers 가격은 월 렌탈료이므로 본체 가격으로 저장하지 않음. 공식 제품 목록의 일시불 구매·장바구니도 확인. |
| AP-2026B | [공식 페이지](https://www.coway.com/product/detail?prdno=1438) | 공식 ProductGroup의 모델 SKU와 InStock 확인. additionalProperty 사양 필드명을 그대로 보존. offers 가격은 월 렌탈료이므로 본체 가격으로 저장하지 않음. 공식 제품 목록의 일시불 구매·장바구니도 확인. |
| RD25AS | [공식 페이지](https://www.lge.co.kr/product/dryers/rd25as) | 공식 상세 스펙 표 대조. 판매 화면에 정확한 모델, 본품 가격 2,391,200원(번들 적용 표시), 배송일 선택·장바구니·구매하기 표시. |

## 사양 대조

추가 항목의 p는 위 출처에만 대응한다. 삼성은 공식 상품명(용량·설치·디스플레이·패키지 구성), 로보락은 공식 products.json의 body_html(세척·살균·건조/흡입·로봇팔·리프팅)과 판매명(직배수), 코웨이는 additionalProperty 전체, LG는 상세 스펙 표를 사용했다.

## AI 점검

사용자 요청으로 실제 AI 응답성 테스트는 보류했다. 새 체크아웃에는 backend/.env가 없으며 API 키를 복사하거나 실제 Gemini를 호출하지 않았다.

## 로컬 검사

- 기존 24개와 원격 develop 데이터가 동일함을 확인. 전체 36개 스키마·중복 검사 통과, 각 제품군 9개.
- 실제 카탈로그를 사용하는 TestClient로 목록 조회와 전체 36개 intake를 확인. 사양 값·공식 URL·확인일 보존 및 미확인 항목의 needs_check 표시 통과.
- 백엔드 pytest 74개, 프론트 요약 테스트 7개 통과. 프론트 lint·TypeScript·빌드 통과.

## 후속 사양 보완

- DV90F22CDT: https://www.samsung.com/sec/support/model/DV90F22CDT/
- DV80H22DDW: https://www.samsung.com/sec/support/model/DV80H22DDW/
- 2026-11-01 공식 지원 스펙 표로 두 모델의 크기(686 × 984 × 872 mm)·무게(78 kg)·건조 방식(인버터 히트펌프 + 히터)·내장 물통(7ℓ)·마이크로 안심필터·필터 알람을 보완했다. 오토 오픈 도어는 CDT 있음, DDW 없음으로 구분했다. 원래 판매 출처 URL은 유지한다.
- 식기세척기 및 로보락의 미확인 치수는 모델별 공식 표를 확보하지 못해 그대로 남긴다.
