import type { Claim, Evidence } from '../types'
import { SCENE_STORY, claimPose, emoteOf, motionOf } from '../story'

export type CastState = { claim?: Claim; evidence: Evidence[] }

export default function SceneCast({ sceneId, state }: { sceneId: string; state: CastState }) {
  const story = SCENE_STORY[sceneId]
  const focus = state.claim
  const changedPro = focus?.side === 'pro' && focus.status !== 'kept'
  const pro = changedPro ? claimPose(focus, state.evidence) : story.prop ? 'pro_tidy' : 'pro_think'
  const con = focus?.side === 'con' ? claimPose(focus, state.evidence) : sceneId.includes('maintenance') || sceneId === 'ap_filter' ? 'con_note' : 'con_inspect'
  return <div key={sceneId} className="stage-cast" aria-hidden="true">
    <div className={`scene-actor actor-pro ${motionOf(pro)} ${story.prop && !changedPro ? 'actor-tidy' : ''} ${focus?.side === 'pro' ? 'actor-speaking' : ''}`}>
      <img key={pro} src={`/assets/kkang/ui_${pro}.png`} alt="" className="actor-body" />
      {story.prop && !changedPro && <img src={`/assets/${story.prop}.png`} alt="" className="actor-object" />}
      <span key={`e-${pro}`} className="actor-emote">{emoteOf(pro)}</span>
    </div>
    <div className={`scene-actor actor-con ${motionOf(con)} ${focus?.side === 'con' ? 'actor-speaking' : ''}`}>
      <img key={con} src={`/assets/kkang/ui_${con}.png`} alt="" className="actor-body" />
      {story.conProp && <img src={`/assets/${story.conProp}.png`} alt="" className="actor-object con-object" />}
      <span key={`e-${con}`} className="actor-emote">{emoteOf(con)}</span>
    </div>
  </div>
}
