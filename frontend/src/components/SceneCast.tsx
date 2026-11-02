import { useEffect, useState } from 'react'
import type { Claim, Evidence } from '../types'
import { CAST_WALK, SCENE_STORY, answerReaction, castStep, claimPose, emoteOf, motionOf, type CastPhase } from '../story'

export type CastState = { claim?: Claim; evidence: Evidence[]; claims?: Claim[]; answered?: string | null }
type Phase = CastPhase | 'walk'

const NEXT: Record<Phase, number> = { enter: 2400, show: 4200, close: 3200, walk: 2600 }
const SCENE_NO = Object.fromEntries(Object.keys(SCENE_STORY).map((id, i) => [id, i]))
const REACT_MS = 2600

// Stage에서 장면마다 key로 다시 만들어 지므로, 장면이 바뀔 때마다 '신나는 등장'부터 시작한다.
export default function SceneCast({ sceneId, state, paused }: { sceneId: string; state: CastState; paused: boolean }) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [cycle, setCycle] = useState(0)
  // 답이 새로 반영될 때마다 번호를 올려 판깡이 등장·반응을 다시 재생한다(장면을 다시 열 때는 처음 값이라 반응 없음).
  const [lastAnswered, setLastAnswered] = useState(state.answered)
  const [reactKey, setReactKey] = useState(0)
  const [doneKey, setDoneKey] = useState(0)
  if (state.answered !== lastAnswered) {
    setLastAnswered(state.answered)
    if (state.answered) setReactKey(reactKey + 1)
  }

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => {
      if (phase === 'close' && cycle % 3 === 1) setPhase('walk')  // 가끔만 잠깐 돌아다니기
      else if (phase === 'show') setPhase('close')
      else { setPhase('show'); setCycle((c) => c + 1) }
    }, NEXT[phase])
    return () => clearTimeout(t)
  }, [phase, cycle, paused])

  useEffect(() => {
    if (!reactKey) return
    const t = setTimeout(() => setDoneKey(reactKey), REACT_MS)
    return () => clearTimeout(t)
  }, [reactKey])
  const reacting = reactKey > doneKey ? reactKey : 0

  const n = (SCENE_NO[sceneId] ?? 0) + cycle
  const reaction = reacting > 0 ? answerReaction(state.answered ?? null, state.claims ?? []) : null
  const focus = state.claim
  const fromClaim = (c: Claim) => { const pose = claimPose(c, state.evidence); return { pose, motion: motionOf(pose), emote: emoteOf(pose) } }
  const step = (side: 'pro' | 'con', offset: number) => phase === 'walk' ? CAST_WALK[side] : castStep(side, phase, n + offset)
  // 우선순위: 답 직후 반응 > 수정·철회된 주장의 표정 > 장면 연출
  const pro = reaction?.pro ?? (focus?.side === 'pro' && focus.status !== 'kept' ? fromClaim(focus) : step('pro', 0))
  const con = reaction?.con ?? (focus?.side === 'con' && focus.status !== 'kept' ? fromClaim(focus) : step('con', 2))
  return <div className="stage-cast" aria-hidden="true">
    <div className={`scene-actor actor-pro ${pro.motion} ${focus?.side === 'pro' ? 'actor-speaking' : ''}`}>
      <img key={pro.pose} src={`/assets/kkang/ui_${pro.pose}.png`} alt="" className="actor-body" />
      <span key={`e-${phase}-${pro.pose}-${reacting}`} className="actor-emote">{pro.emote}</span>
    </div>
    <div className={`scene-actor actor-con ${con.motion} ${focus?.side === 'con' ? 'actor-speaking' : ''}`}>
      <img key={con.pose} src={`/assets/kkang/ui_${con.pose}.png`} alt="" className="actor-body" />
      <span key={`e-${phase}-${con.pose}-${reacting}`} className="actor-emote">{con.emote}</span>
    </div>
    {reacting > 0 && <div key={`g-${reacting}`} className="scene-actor actor-guide">
      <img src={`/assets/kkang/ui_${state.answered === 'skip' ? 'guide_wave' : 'guide_listen'}.png`} alt="" className="actor-body" />
      <span className="actor-emote">{state.answered === 'skip' ? '…' : '!'}</span>
    </div>}
  </div>
}
