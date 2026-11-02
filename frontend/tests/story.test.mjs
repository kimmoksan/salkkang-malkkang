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
