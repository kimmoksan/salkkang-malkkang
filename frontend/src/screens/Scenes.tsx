import { useEffect, useRef, useState } from 'react'
import Stage from '../components/Stage'
import Kkang from '../components/Kkang'
import HearingPanel from './HearingPanel'
import { SCENES } from '../scenes'
import { SCENE_STORY } from '../story'
import type { Hearing, Product } from '../types'

type Props = {
  product: Product; onBack: () => void; onFinish: () => void
  hearings: Record<string, Hearing>; bases: Record<string, Hearing>; answers: Record<string, string>
  onHearing: (hearing: Hearing) => void; onAnswer: (id: string, answer: string) => void
  index: number; onIndexChange: (index: number) => void; active: boolean
}

export default function Scenes({ product, onBack, onFinish, hearings, bases, answers, onHearing, onAnswer, index, onIndexChange, active }: Props) {
  const scenes = SCENES[product.category]
  const scene = scenes[index]
  const story = SCENE_STORY[scene.id]
  const [paused, setPaused] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  const [selected, setSelected] = useState<{ scene: string; claim: string } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const answer = answers[scene.id] ?? null
  // 답변을 다시 받는 동안 이전 답의 표정·주장을 보여주지 않는다.
  const hearing = hearings[scene.id]?.answered === answer ? hearings[scene.id] : undefined
  const updatingAnswer = answer !== null && !hearing
  const focus = hearing?.claims.find((c) => selected?.scene === scene.id && c.id === selected.claim) ?? hearing?.claims[0]

  useEffect(() => {
    // 숨겨진 장면은 Stage가 이미 멈춘다. 여기서 !active까지 걸면 결과 화면의 깡이도 같이 얼어 버린다.
    document.documentElement.toggleAttribute('data-still', paused && active)
    return () => document.documentElement.removeAttribute('data-still')
  }, [paused, active])
  useEffect(() => { if (active) heading.current?.focus({ preventScroll: true }) }, [index, active])

  return <section className="scenes living-hearing">
    <div className="living-layout">
      <div className="living-stage-column">
        <header className="story-header">
          <p className="eyebrow">{product.name} · 우리 집에서 써본다면</p>
          <h1 ref={heading} tabIndex={-1}>{story.title}</h1> <span className="tag outline scene-note">사용 상황 예시 · AI 구성 아님</span>
        </header>
        <div className="living-player">
          <Stage scene={scene} paused={paused || !active} cast={{ claim: focus, evidence: hearing?.evidence ?? [], claims: hearing?.claims ?? [], answered: hearing?.answered ?? null }} />
          <div className="player-bar">
            <button type="button" className="secondary small" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '움직임 다시 보기' : '움직임 멈추기'}</button>
            <p className="caption">{story.action}</p>
          </div>
          <nav className="story-trail" aria-label="사용 상황 돌아보기">
            {scenes.map((s, i) => <button key={s.id} type="button" aria-current={i === index ? 'step' : undefined} onClick={() => onIndexChange(i)}>{SCENE_STORY[s.id].short}</button>)}
          </nav>
        </div>
        <details className="card scene-context">
          <summary>장면 설명과 가정 살펴보기</summary>
          <p>{scene.caption}</p>
          <div className="cond"><span className="tag outline">사용자 입력</span><p>“{product.reason}”</p></div>
          <div className="cond"><span className="tag kind-assumption">가정</span><p>{scene.assumption}</p></div>
          <div className="cond"><span className="tag kind-unverified">확인 필요</span><p>{scene.needsCheck}</p></div>
          <p className="muted small">깡깡이의 동작은 생활 상황의 예시예요. 실제 집 구조·축척·제품 성능을 재현하지 않아요.</p>
        </details>
      </div>
      <section className="conversation card" aria-label="청문회 대화">
        <div className="conversation-heading"><h2>같이 따져보자</h2><span className="muted small">이 장면의 이야기</span></div>
        <HearingPanel key={scene.id} product={product} sceneId={scene.id} answer={answer} cached={hearings[scene.id]} base={bases[scene.id]} onLoaded={onHearing} onAnswer={(a) => onAnswer(scene.id, a)} onFocus={(claim) => setSelected({ scene: scene.id, claim })}
          others={Object.values(hearings).filter((h) => h.scene_id !== scene.id && h.mode === 'live').flatMap((h) => h.claims.map((c) => `${c.side}: ${c.text}`)).slice(0, 12)} />
        <div className="story-next">
          <div className="guide-line"><Kkang pose="guide_present" size="sm" /><p><strong>판깡이</strong><br />{story.bridge}</p></div>
          <button type="button" className="primary" onClick={index < scenes.length - 1 ? () => onIndexChange(index + 1) : onFinish}>{story.next} →</button>
          {updatingAnswer && <p className="muted small" role="status">네 답을 반영하고 있어. 기다리지 않고 넘어가도 괜찮아.</p>}
          {!hearing && !updatingAnswer && <p className="muted small">지금 넘어가면 이 장면은 ‘확인 안 함’으로 남아요.</p>}
        </div>
      </section>
    </div>
    <div className="row between nav-row"><button type="button" className="link" onClick={onBack}>← 이전으로</button><button type="button" className="link small" onClick={onFinish}>지금까지 본 내용 정리하기</button></div>
  </section>
}
