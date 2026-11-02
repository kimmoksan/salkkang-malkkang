import { useEffect, useState } from 'react'
import type { Claim, Evidence } from '../types'
import { SCENE_STORY, castStep, claimPose, emoteOf, motionOf, type CastPhase } from '../story'

export type CastState = { claim?: Claim; evidence: Evidence[] }

const NEXT: Record<CastPhase, [CastPhase, number]> = { enter: ['show', 2400], show: ['close', 4200], close: ['show', 3200] }
const SCENE_NO = Object.fromEntries(Object.keys(SCENE_STORY).map((id, i) => [id, i]))

// Stage에서 장면마다 key로 다시 만들어 지므로, 장면이 바뀔 때마다 '신나는 등장'부터 시작한다.
export default function SceneCast({ sceneId, state, paused }: { sceneId: string; state: CastState; paused: boolean }) {
  const [phase, setPhase] = useState<CastPhase>('enter')
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    if (paused) return
    const [next, ms] = NEXT[phase]
    const t = setTimeout(() => { setPhase(next); if (next === 'show') setCycle((c) => c + 1) }, ms)
    return () => clearTimeout(t)
  }, [phase, paused])

  const n = (SCENE_NO[sceneId] ?? 0) + cycle
  const focus = state.claim
  // 공방에서 주장이 수정·철회되었거나 말깡이 발언을 보는 중이면, 그 상태의 표정을 먼저 보여 준다.
  const pro = focus?.side === 'pro' && focus.status !== 'kept'
    ? { pose: claimPose(focus, state.evidence), motion: motionOf(claimPose(focus, state.evidence)), emote: emoteOf(claimPose(focus, state.evidence)) }
    : castStep('pro', phase, n)
  const con = focus?.side === 'con' && focus.status !== 'kept'
    ? { pose: claimPose(focus, state.evidence), motion: motionOf(claimPose(focus, state.evidence)), emote: emoteOf(claimPose(focus, state.evidence)) }
    : castStep('con', phase, n + 2)
  return <div className="stage-cast" aria-hidden="true">
    <div className={`scene-actor actor-pro ${pro.motion} ${focus?.side === 'pro' ? 'actor-speaking' : ''}`}>
      <img key={pro.pose} src={`/assets/kkang/ui_${pro.pose}.png`} alt="" className="actor-body" />
      <span key={`e-${phase}-${pro.pose}`} className="actor-emote">{pro.emote}</span>
    </div>
    <div className={`scene-actor actor-con ${con.motion} ${focus?.side === 'con' ? 'actor-speaking' : ''}`}>
      <img key={con.pose} src={`/assets/kkang/ui_${con.pose}.png`} alt="" className="actor-body" />
      <span key={`e-${phase}-${con.pose}`} className="actor-emote">{con.emote}</span>
    </div>
  </div>
}
