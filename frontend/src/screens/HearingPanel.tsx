import { useEffect, useState } from 'react'
import { ApiError, fetchHearing } from '../api'
import Kkang from '../components/Kkang'
import type { EvidenceKind, Hearing, Product } from '../types'

type Props = {
  product: Product
  sceneId: string
  answer: string | null
  onAnswer: (answer: string) => void
  cached?: Hearing
  base?: Hearing
  onLoaded: (hearing: Hearing) => void
  onFocus: (claimId: string) => void
}

const KIND_LABEL: Record<EvidenceKind, string> = {
  product_fact: '제품 사실',
  user_statement: '사용자 진술',
  assumption: '가정',
  unverified: '확인 필요',
}
// 캐릭터는 말투만 다르다. 근거 규칙은 같고, 누구도 '사세요/사지 마세요'로 결론 내지 않는다.
const SIDE = {
  pro: { label: '살깡이', role: '찬성', intro: '이게 생기면 뭐가 좋아지는지 말해요' },
  con: { label: '말깡이', role: '반대', intro: '감당해야 할 부담을 콕 짚어 물어요' },
}
const STATUS = { revised: '주장 수정', withdrawn: '주장 철회' }

export default function HearingPanel({ product, sceneId, answer, onAnswer, cached, base, onLoaded, onFocus }: Props) {
  const [response, setResponse] = useState<{ answer: string | null; hearing?: Hearing; error?: string } | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (cached && cached.answered === answer) return
    let alive = true
    fetchHearing({
      category: product.category,
      scene_id: sceneId,
      reason: product.reason,
      // AI가 웹에서 찾은 자료는 제품 사실 근거로 인용할 수 없게 뺀다.
      source_ids: product.sources.filter((s) => s.kind !== 'ai').map((s) => s.id),
      answer,
      facts: product.sources.slice(0, 5).map((s) => ({ source_id: s.id, text: s.text.slice(0, 3000), verified: s.kind !== 'ai' })),
      previous: answer ? base ?? cached ?? null : null,
    })
      .then((h) => {
        if (!alive) return
        setResponse({ answer, hearing: h })
        onLoaded(h)
      })
      .catch((e) => alive && setResponse({ answer, error: e instanceof ApiError ? e.message : '공방을 불러오지 못했어요.' }))
    return () => { alive = false }
  }, [product, sceneId, answer, retry, cached, base, onLoaded])

  const hearing = cached?.answered === answer ? cached : response?.answer === answer ? response.hearing : undefined
  const error = response?.answer === answer && !hearing ? response.error : undefined

  if (error) {
    return (
      <div className="card" role="alert">
        <p>{error}</p>
        <button type="button" className="secondary small" onClick={() => { setResponse(null); setRetry(retry + 1) }}>다시 시도</button>
      </div>
    )
  }
  if (!hearing) return (
    <div className="hearing-loading" role="status">
      <Kkang pose="guide_moderate" />
      <p className="muted">판깡이가 이야기를 모으고 있어요. 잠시만요!</p>
    </div>
  )

  const claimById = new Map(hearing.claims.map((c) => [c.id, c]))
  return <div className="hearing-thread">
    <p className="tag outline mode-tag">{hearing.mode === 'mock' ? '예시 공방 · 실제 AI 응답 아님' : 'AI 공방 · 근거를 직접 확인하세요'}</p>
    {hearing.notice && <p className="muted small" role="status">{hearing.notice}</p>}
    <ol className="claims chat-claims">
      {hearing.claims.map((c) => {
        const repliesTo = c.replies_to ? claimById.get(c.replies_to) : undefined
        return <li key={c.id} className={`chat-claim side-${c.side}`}>
          <div className="chat-speaker"><strong><span aria-hidden="true">●</span> {SIDE[c.side].label}</strong><span className="muted small">{SIDE[c.side].role}</span></div>
          <div className="bubble">
            {repliesTo && <p className="muted small">↳ {SIDE[repliesTo.side].label}의 말에 덧붙여</p>}
            <p>{c.text}</p>
            {c.status !== 'kept' && <div className="claim-change"><strong>{STATUS[c.status]}</strong><p>{c.change_reason}</p></div>}
            <details className="claim-evidence" onToggle={(event) => { if (event.currentTarget.open) onFocus(c.id) }}>
              <summary>근거 {c.evidence_ids.length}개 살펴보기</summary>
              <ul className="evidence-list">{c.evidence_ids.map((id) => {
                const e = hearing.evidence.find((item) => item.id === id)
                if (!e) return null
                const source = product.sources.find((s) => s.id === e.source_id)
                return <li key={id}><span className={`tag kind-${e.kind}`}>{KIND_LABEL[e.kind]}</span><p>{e.text}</p>
                  {source?.url && <a className="url small" href={source.url} target="_blank" rel="noopener noreferrer">{source.kind === 'catalog' ? `제조사 공식 · 확인일 ${source.checked_at ?? '확인 필요'}` : '자료 출처 보기'} ↗</a>}
                </li>
              })}</ul>
            </details>
          </div>
        </li>
      })}
    </ol>
    {hearing.question && <div className="question card">
      <div className="question-body">
        <p className="eyebrow small">판깡이가 하나만 물어볼게</p>
        <p id="q-text"><strong>{hearing.question.text}</strong></p>
        <div className="row" role="group" aria-labelledby="q-text">
          {[...hearing.question.options, { id: 'skip', label: '건너뛰기 · 확인 안 함' }].map((o) => <button key={o.id} type="button" className={hearing.answered === o.id ? 'primary small' : 'secondary small'} aria-pressed={hearing.answered === o.id} onClick={() => onAnswer(o.id)}>{o.label}</button>)}
        </div>
        <p className="muted small" role="status">{hearing.answered === 'skip' ? '확인 안 함으로 남겨 뒀어. 나중에 답해도 괜찮아.' : hearing.answered ? '네 답을 반영했어. 바뀐 주장과 이유를 함께 살펴봐.' : '답하지 않고 다음으로 넘어가도 괜찮아.'}</p>
      </div>
    </div>}
  </div>
}
