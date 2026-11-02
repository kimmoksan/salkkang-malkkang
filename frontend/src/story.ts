import type { Claim, Evidence } from './types'
import type { KkangPose } from './components/Kkang'

type Story = { title: string; short: string; action: string; bridge: string; next: string }
const ACTION = '살깡이는 신이 나서 좋은 점을 소개하고, 말깡이는 흠… 하다가 돋보기로 제품을 꼼꼼히 살펴봐요.'
export const SCENE_STORY: Record<string, Story> = {
  rv_daily: { title: '청소하는 동안, 잠깐 쉴까?', short: '청소하는 동안', action: ACTION, bridge: '잠깡! 바닥에 물건이 있을 때도 살펴보자.', next: '바닥 정리도 볼까?' },
  rv_clutter: { title: '잠깡! 바닥부터 살펴보자', short: '바닥 정리', action: ACTION, bridge: '청소가 끝나면, 뒷정리도 같이 살펴보자.', next: '뒷정리도 볼까?' },
  rv_maintenance: { title: '다 썼다면, 뒷정리도', short: '사용 후 관리', action: ACTION, bridge: '편한 점과 챙길 점을 함께 봤네. 이제 네 생각을 정리해 보자.', next: '내 생각 정리하기' },
  dw_load: { title: '밥 먹었으니, 설거지 시간', short: '식기 넣기', action: ACTION, bridge: '잠깡! 자주 쓰는 큰 냄비도 들어갈까?', next: '큰 식기도 볼까?' },
  dw_constraint: { title: '이 냄비도 들어갈까?', short: '크기와 소재', action: ACTION, bridge: '넣을 식기를 살펴봤으니, 사용 후 관리도 보자.', next: '필터 관리도 볼까?' },
  dw_maintenance: { title: '설거지 뒤에 챙길 것', short: '사용 후 관리', action: ACTION, bridge: '좋은 점도, 챙길 점도 모였어. 어떤 생각이 들었어?', next: '내 생각 정리하기' },
  dr_cycle: { title: '빨래가 끝나면, 건조할 차례', short: '빨래 말리기', action: ACTION, bridge: '잠깡! 모든 옷을 함께 넣어도 되는지 살펴보자.', next: '옷의 소재도 볼까?' },
  dr_constraint: { title: '이 옷은 한 번 더 확인', short: '옷감과 용량', action: ACTION, bridge: '옷을 꺼낸 뒤에 챙길 일도 남아 있어.', next: '뒷정리도 볼까?' },
  dr_maintenance: { title: '보송해진 뒤에 챙길 것', short: '사용 후 관리', action: ACTION, bridge: '우리 이야기를 모아 뒀어. 결정은 네가 천천히 골라 줘.', next: '내 생각 정리하기' },
  ap_run: { title: '어디에 두고 쓰면 좋을까?', short: '공간에서 사용', action: ACTION, bridge: '낮에 쓰는 모습은 봤네. 잠드는 시간에도 살펴볼까?', next: '밤에도 살펴볼까?' },
  ap_night: { title: '잠드는 시간에는 어떨까?', short: '잠드는 시간', action: ACTION, bridge: '잠깡! 계속 쓰려면 필터 관리도 알아봐야 해.', next: '필터도 살펴볼까?' },
  ap_filter: { title: '필터도 챙겨 줘야지', short: '필터 관리', action: ACTION, bridge: '함께 살펴본 내용을 모았어. 네 생활에 맞는지 정리해 보자.', next: '내 생각 정리하기' },
}

// 문장을 다시 쓰거나 사실을 바꾸지 않고, 근거·주장 상태만 표정에 연결한다.
export function claimPose(claim: Claim, evidence: Evidence[]): KkangPose {
  if (claim.side === 'pro') {
    if (claim.status === 'withdrawn') return 'pro_shy'
    if (claim.status === 'revised') return 'pro_think'
    return 'pro_wave'
  }
  if (claim.status !== 'kept') return 'con_relieved'
  if (claim.evidence_ids.some((id) => evidence.find((e) => e.id === id)?.kind === 'unverified')) return 'con_inspect'
  return claim.replies_to ? 'con_question' : 'con_curious'
}

// 포즈마다 어울리는 짧은 반복 동작(손 흔들기·폴짝·갸웃 등). 동작 사이에 쉬는 구간을 둬서 산만하지 않게.
const MOTION: Record<string, string> = {
  pro_wave: 'wave', guide_wave: 'wave', guide_greet: 'wave',
  pro_excited: 'hop', pro_jump: 'hop', con_relieved: 'hop',
  pro_think: 'tilt', con_curious: 'tilt', guide_listen: 'tilt',
  con_inspect: 'scan', guide_review: 'scan',
  pro_present: 'nod', pro_tidy: 'nod', con_note: 'nod', guide_present: 'nod', guide_moderate: 'nod',
  con_question: 'raise', con_surprised: 'shake', pro_shy: 'squish',
}
export const motionOf = (pose: string) => `kk-${MOTION[pose] ?? 'bob'}`

// 머리 위 작은 감정 표시. 분위기만 전하고 판정(승패·추천)을 뜻하지 않는다.
const EMOTE: Record<string, string> = {
  pro_tidy: '♪', pro_wave: '♪', pro_present: '!', pro_excited: '✦', pro_jump: '✦', pro_think: '…', pro_shy: '♡',
  con_curious: '?', con_inspect: '?', con_question: '?', con_note: '✎', con_surprised: '!', con_relieved: '✓',
}
export const emoteOf = (pose: string) => EMOTE[pose] ?? ''

// 장면 연출: 등장(살깡이 신남 · 말깡이 흠) → 소개·조사(살깡이 제품 소개 · 말깡이 돋보기로 다가가기) → 마무리(끄덕끄덕 · 도리도리).
// 동작 30개(살깡이 15, 말깡이 15)를 장면·반복 차수마다 돌려 써서 매번 조금씩 다르게 움직인다. 분위기 연출일 뿐 판정이 아니다.
export type CastPhase = 'enter' | 'show' | 'close'
export const CAST_MOTIONS = {
  pro: {
    enter: ['joy-hop', 'joy-double', 'joy-spin', 'joy-wiggle', 'joy-cheer'],
    show: ['show-sweep', 'show-point', 'show-sparkle', 'show-lean', 'show-bounce'],
    close: ['nod-nod', 'nod-slow', 'nod-bow', 'nod-sway', 'nod-happy'],
  },
  con: {
    enter: ['hmm-sway', 'hmm-tap', 'hmm-tilt', 'hmm-squint', 'hmm-step'],
    show: ['probe-approach', 'probe-peer', 'probe-scan', 'probe-zoom', 'probe-circle'],
    close: ['shake-head', 'shake-slow', 'shake-sigh', 'shake-shrug', 'shake-jot'],
  },
} as const
const CAST_POSE = {
  pro: { enter: 'pro_jump', show: 'pro_present', close: 'pro_excited' },
  con: { enter: 'con_curious', show: 'con_inspect', close: 'con_curious' },
} as const
const CAST_EMOTE = { pro: { enter: '✦', show: '!', close: '♪' }, con: { enter: '흠', show: '?', close: '…' } }

export function castStep(side: 'pro' | 'con', phase: CastPhase, n: number) {
  const list = CAST_MOTIONS[side][phase]
  return { pose: CAST_POSE[side][phase] as KkangPose, motion: `kc-${list[n % list.length]}`, emote: CAST_EMOTE[side][phase] }
}
