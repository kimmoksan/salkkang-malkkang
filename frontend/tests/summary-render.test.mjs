import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
after(() => server.close())
const { default: DecisionSummary } = await server.ssrLoadModule('/src/screens/DecisionSummary.tsx')
const product = { category: 'robot_vacuum', name: '테스트 제품', reason: '청소 부담', specs: [], sources: [], notices: [] }
const hearings = { rv_daily: { scene_id: 'rv_daily', mode: 'mock', answered: 'skip',
  question: { id: 'q', text: '정리할 수 있나요?', options: [{ id: 'ok', label: '괜찮아요' }] },
  evidence: [{ id: 'e', kind: 'assumption', text: '바닥 정리를 한다면' }],
  claims: [{ id: 'c', side: 'con', status: 'revised', text: '정리 부담은 남아요', evidence_ids: ['e'], change_reason: '사용자가 감수한다고 답함' }],
} }
const render = (choice = null) => renderToStaticMarkup(createElement(DecisionSummary, { product, hearings, draft: { choice, reason: '' }, onChange() {}, onReview() {}, onRestart() {} }))

test('결과 화면은 수정 이유·건너뛴 질문·예시 표시를 실제 마크업에 남긴다', () => {
  const html = render()
  for (const text of ['변경 이유: 사용자가 감수한다고 답함', '확인 안 함 (건너뜀)', '실제 AI 응답 아님', '이 장면 확인하기']) assert.ok(html.includes(text))
  assert.equal((html.match(/type="radio"/g) ?? []).length, 3)
  assert.ok(!html.includes('checked=""'))
})

test('구매·보류·비구매 모두 같은 진행자 표정을 쓰며 한 선택만 표시한다', () => {
  for (const choice of ['buy', 'hold', 'decline']) {
    const html = render(choice)
    assert.equal((html.match(/checked=""/g) ?? []).length, 1)
    assert.ok(html.includes('ui_guide_review.png'))
    assert.ok(!html.includes('ui_pro_') && !html.includes('ui_con_'))
  }
})
