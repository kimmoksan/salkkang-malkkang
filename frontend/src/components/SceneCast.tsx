import type { Claim, Evidence } from '../types'
import { SCENE_STORY, claimPose } from '../story'

export type CastState = { claim?: Claim; evidence: Evidence[] }

export default function SceneCast({ sceneId, state }: { sceneId: string; state: CastState }) {
  const story = SCENE_STORY[sceneId]
  const focus = state.claim
  const changedPro = focus?.side === 'pro' && focus.status !== 'kept'
  const pro = changedPro ? claimPose(focus, state.evidence) : story.prop ? 'pro_tidy' : 'pro_think'
  const con = focus?.side === 'con' ? claimPose(focus, state.evidence) : sceneId.includes('maintenance') || sceneId === 'ap_filter' ? 'con_note' : 'con_inspect'
  return <div key={sceneId} className="stage-cast" aria-hidden="true">
    <div className={`scene-actor actor-pro ${story.prop && !changedPro ? 'actor-tidy' : ''} ${focus?.side === 'pro' ? 'actor-speaking' : ''}`}>
      <img key={pro} src={`/assets/kkang/ui_${pro}.png`} alt="" className="actor-body" />
      {story.prop && !changedPro && <img src={`/assets/${story.prop}.png`} alt="" className="actor-object" />}
    </div>
    <div className={`scene-actor actor-con ${focus?.side === 'con' ? 'actor-speaking' : ''}`}>
      <img key={con} src={`/assets/kkang/ui_${con}.png`} alt="" className="actor-body" />
    </div>
  </div>
}
