# 살깡말깡 이미지 자료와 생활 무대 UI

보관일: 2026-11-02. 이 대화에서 생성한 원본 13개를 보존한다(자료 12개 + 앱 자산 1개). 생성 도구는 내장 image_gen이며, 아래 자료는 실제 동작 화면을 캡처한 것이 아닌 생성 시안이다. 이전 이름과 미채택 시안도 디자인 이력으로 남긴다. 파일별 원본 이름과 SHA-256은 manifest.json에 기록했다.

## 이미지 목록

- [초기 BEFORE 로고 비교안](generated/01-before-logo-options.png)
- [살깡말깡 브랜드와 캐릭터 보드](generated/02-brand-characters.png)
- [워드마크 원본](generated/03-logo-wordmark.png)
- [집과 말풍선 로고 마크 원본](generated/04-logo-mark.png)
- [살깡이 초상 원본](generated/05-pro-portrait.png)
- [말깡이 초상 원본](generated/06-con-portrait.png)
- [판깡이 초상 원본](generated/07-guide-portrait.png)
- [표정·동작 18종 시안](generated/08-expressions-board.png)
- [표정·동작 투명 원본 시트](generated/09-expressions-transparent.png)
- [캐릭터 과다 배치로 채택하지 않은 UI 시안](generated/10-ui-dense-rejected.png)
- [캐릭터 노출을 줄인 데스크톱 시안](generated/11-ui-restrained.png)
- [큰 생활 무대와 오른쪽 청문회: 이번 구현의 기준 시안](generated/12-living-hearing.png)
- [살깡이 집어 들기 동작: 앱에서 사용하는 투명 PNG](../../../frontend/public/assets/kkang/ui_pro_tidy.png)

## 구현 범위

- 큰 생활 무대와 오른쪽 청문회, 900px 이하에서는 세로 배치.
- 장면 배경은 유지하고 소품 등장·깡깡이의 집기·갸웃 동작을 1회 재생. 다음 장면은 사용자가 선택한다.
- 기존 18개 표정 자산을 재사용하며 수정·철회·미확인 상태를 표정에 연결한다. 근거를 펼친 발언에 맞춰 무대 표정이 바뀐다.
- 말투는 안내에만 자연스럽게 적용한다. 잠깡! 외에 어미마다 깡을 붙이지 않으며, 근거·API 발언 원문은 바꾸지 않는다.
- 결과는 근거 노트와 내 선택을 좌우 배치한다. 구매·보류·비구매를 같은 크기와 같은 진행자 표정으로 제공한다.
- 시안에 그려진 음량·초 단위 타임라인은 구현 기능이 아니다. 기존 움직임 멈추기와 장면 이동을 사용한다.
- 생성 이미지 속 제품·기능·사양·문구는 자료 검증 근거가 아니다. 실서비스의 공식 출처와 확인 필요 표시를 따른다.

## 새 앱 자산 생성 프롬프트

입력 참조: frontend/public/assets/kkang/ui_pro_wave.png. 투명 배경으로 생성하고 원본을 수정 없이 ui_pro_tidy.png에 보관했다.

```text
Create a single transparent PNG game sprite of this EXACT mint green Korean mascot 살깡이. Preserve exact character design, palette, thick dark wobbly pixel-like edge, cream face, blush, sprout tuft. Whole body with two clearly visible tiny stubby feet; no long legs. New pose: crouching and leaning a little to the right, looking down with focused gentle cheerful expression, both little hands reaching forward/down as if picking up a floor item. Hands EMPTY: no objects, no checkmark, no sign, no text, no tool. This sprite will have different household objects positioned beside hands by code. Consistent clean 2D illustrated sprite, not 3D, no background, no cast shadow, no UI, one character centered occupying canvas with small margin. Actual alpha transparency.
```
