import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { SCENE_STORY, claimPose } from '../src/story.ts'
import { SCENES } from '../src/scenes.ts'

const claim = (side, status = 'kept') => ({ side, status, evidence_ids: ['e'], replies_to: 'other' })
const evidence = [{ id: 'e', kind: 'unverified' }]

test('주장 수정·철회 표정은 미확인 근거보다 우선하며 원문을 바꾸지 않는다', () => {
  const revised = claim('con', 'revised')
  const before = JSON.stringify(revised)
  assert.equal(claimPose(revised, evidence), 'con_relieved')
  assert.equal(claimPose(claim('pro', 'revised'), evidence), 'pro_think')
  assert.equal(claimPose(claim('pro', 'withdrawn'), evidence), 'pro_shy')
  assert.equal(claimPose(claim('con'), evidence), 'con_inspect')
  assert.equal(JSON.stringify(revised), before)
})

test('모든 제품군의 장면에 연결 안내와 실제 존재하는 동작 소품이 있다', () => {
  for (const scenes of Object.values(SCENES)) {
    for (const scene of scenes) {
      const story = SCENE_STORY[scene.id]
      assert.ok(story?.bridge && story.next && story.action)
      if (story.prop) assert.ok(existsSync(new URL(`../public/assets/${story.prop}.png`, import.meta.url)))
    }
    assert.equal(SCENE_STORY[scenes.at(-1).id].next, '내 생각 정리하기')
  }
})

test('깡이 장면 동작 30개가 모두 다르고 CSS에 실제 동작이 있으며, 단계마다 정해진 표정을 쓴다', async () => {
  const { CAST_MOTIONS, castStep } = await import('../src/story.ts')
  const { readFileSync } = await import('node:fs')
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const all = Object.values(CAST_MOTIONS).flatMap((p) => Object.values(p).flat())
  assert.equal(all.length, 30)
  assert.equal(new Set(all).size, 30)
  for (const m of all) assert.ok(css.includes(`@keyframes kc-${m} `) && css.includes(`.kc-${m} {`), m)
  assert.equal(castStep('pro', 'enter', 0).pose, 'pro_jump')       // 장면이 바뀌면 신나게
  assert.equal(castStep('con', 'show', 0).pose, 'con_inspect')     // 돋보기로 조사
  assert.match(castStep('con', 'close', 0).motion, /^kc-shake-/)   // 마무리 도리도리
  assert.match(castStep('pro', 'close', 0).motion, /^kc-nod-/)     // 마무리 끄덕끄덕
  assert.notEqual(castStep('pro', 'show', 0).motion, castStep('pro', 'show', 1).motion)  // 반복마다 다르게
})
