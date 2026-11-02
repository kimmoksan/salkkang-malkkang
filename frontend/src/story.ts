import type { Claim, Evidence } from './types'
import type { KkangPose } from './components/Kkang'

type Story = { title: string; short: string; action: string; bridge: string; next: string; prop?: string }
export const SCENE_STORY: Record<string, Story> = {
  rv_daily: { title: '청소하는 동안, 잠깐 쉴까?', short: '청소하는 동안', action: '살깡이는 청소기를 바라보고, 말깡이는 주변을 살펴봐요.', bridge: '잠깡! 바닥에 물건이 있을 때도 살펴보자.', next: '바닥 정리도 볼까?' },
  rv_clutter: { title: '잠깡! 바닥부터 살펴보자', short: '바닥 정리', action: '살깡이는 장난감을 들어 올리고, 말깡이는 전선을 살펴봐요.', bridge: '청소가 끝나면, 뒷정리도 같이 살펴보자.', next: '뒷정리도 볼까?', prop: 'prop_toy' },
  rv_maintenance: { title: '다 썼다면, 뒷정리도', short: '사용 후 관리', action: '살깡이는 먼지통을 들고, 말깡이는 관리할 부분을 메모해요.', bridge: '편한 점과 챙길 점을 함께 봤네. 이제 네 생각을 정리해 보자.', next: '내 생각 정리하기', prop: 'rv_dustbin' },
  dw_load: { title: '밥 먹었으니, 설거지 시간', short: '식기 넣기', action: '살깡이가 식기를 챙기고, 말깡이는 넣을 공간을 살펴봐요.', bridge: '잠깡! 자주 쓰는 큰 냄비도 들어갈까?', next: '큰 식기도 볼까?', prop: 'prop_dishes' },
  dw_constraint: { title: '이 냄비도 들어갈까?', short: '크기와 소재', action: '살깡이는 식기를 살펴보고, 말깡이는 크기와 소재를 확인해요.', bridge: '넣을 식기를 살펴봤으니, 사용 후 관리도 보자.', next: '필터 관리도 볼까?' },
  dw_maintenance: { title: '설거지 뒤에 챙길 것', short: '사용 후 관리', action: '살깡이는 필터를 들고, 말깡이는 관리할 부분을 메모해요.', bridge: '좋은 점도, 챙길 점도 모였어. 어떤 생각이 들었어?', next: '내 생각 정리하기', prop: 'dw_filter' },
  dr_cycle: { title: '빨래가 끝나면, 건조할 차례', short: '빨래 말리기', action: '살깡이가 빨래를 챙기고, 말깡이는 건조기를 살펴봐요.', bridge: '잠깡! 모든 옷을 함께 넣어도 되는지 살펴보자.', next: '옷의 소재도 볼까?', prop: 'prop_clothes' },
  dr_constraint: { title: '이 옷은 한 번 더 확인', short: '옷감과 용량', action: '살깡이는 옷을 살펴보고, 말깡이는 주의할 소재를 확인해요.', bridge: '옷을 꺼낸 뒤에 챙길 일도 남아 있어.', next: '뒷정리도 볼까?' },
  dr_maintenance: { title: '보송해진 뒤에 챙길 것', short: '사용 후 관리', action: '살깡이는 필터를 들고, 말깡이는 관리할 부분을 메모해요.', bridge: '우리 이야기를 모아 뒀어. 결정은 네가 천천히 골라 줘.', next: '내 생각 정리하기', prop: 'dr_filter' },
  ap_run: { title: '어디에 두고 쓰면 좋을까?', short: '공간에서 사용', action: '살깡이는 제품을 바라보고, 말깡이는 놓을 곳을 살펴봐요.', bridge: '낮에 쓰는 모습은 봤네. 잠드는 시간에도 살펴볼까?', next: '밤에도 살펴볼까?' },
  ap_night: { title: '잠드는 시간에는 어떨까?', short: '잠드는 시간', action: '깡깡이들이 불을 낮춘 방에서 표시등을 살펴봐요.', bridge: '잠깡! 계속 쓰려면 필터 관리도 알아봐야 해.', next: '필터도 살펴볼까?' },
  ap_filter: { title: '필터도 챙겨 줘야지', short: '필터 관리', action: '살깡이는 필터를 들고, 말깡이는 교체할 때 챙길 점을 메모해요.', bridge: '함께 살펴본 내용을 모았어. 네 생활에 맞는지 정리해 보자.', next: '내 생각 정리하기', prop: 'ap_filter' },
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
