import { useEffect, useState, type FormEvent } from 'react'
import { fetchCatalog, type FieldErrors } from '../api'
import { CATEGORIES, type CatalogProduct, type IntakeInput } from '../types'

type Props = {
  input: IntakeInput
  onChange: (input: IntakeInput) => void
  onSubmit: () => void
  onExample: () => void
  busy: boolean
  errors: FieldErrors
  message: string | null
}

export default function Intro({ input, onChange, onSubmit, onExample, busy, errors, message }: Props) {
  const [local, setLocal] = useState<FieldErrors>({})
  const [manual, setManual] = useState(!input.catalog_model && !!input.product_text)
  const [brand, setBrand] = useState('')
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState(false)
  const [retry, setRetry] = useState(0)
  const shown = { ...errors, ...local }
  const brands = [...new Set(products.map((p) => p.brand))]

  useEffect(() => {
    let alive = true
    fetchCatalog(input.category)
      .then((items) => { if (alive) setProducts(items) })
      .catch(() => { if (alive) { setCatalogError(true); setProducts([]) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [input.category, retry])

  function change(next: IntakeInput) {
    setLocal({})
    onChange(next)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: FieldErrors = {}
    if (manual && !input.product_text.trim()) next.product_text = '제품 링크나 제품 정보를 입력해 주세요.'
    if (!manual && (!input.catalog_model || !products.some((p) => p.model === input.catalog_model))) {
      next.catalog_model = '제품 모델을 선택해 주세요.'
    }
    setLocal(next)
    if (Object.keys(next).length === 0) onSubmit()
  }

  function start() {
    const form = document.getElementById('intake')
    form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    form?.querySelector<HTMLInputElement>('input[name="category"]:checked')?.focus({ preventScroll: true })
  }

  return (
    <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">가전 살까 말까, 고민될 때</p>
        <h1><span className="hero-shout">잠깡!</span><br />사기 전에,<br />우리 얘기 좀 해볼까?</h1>
        <p className="hero-lead">살깡이의 기대도, 말깡이의 걱정도.<br />함께 듣고, 결정은 네가 해.</p>
        <button type="button" className="primary hero-cta" onClick={start}>제품 고르고 시작하기 →</button>
        <p className="muted small hero-cats">{CATEGORIES.map((c) => c.label).join('  ·  ')}</p>
      </div>
      <div className="hero-art">
        <img src="/assets/hero.webp" width={1402} height={1122}
          alt="거실 러그 위 로봇청소기를 두고 살깡이는 신나 하고, 판깡이는 메모를 들고, 말깡이는 돋보기로 살펴보는 그림" />
        <p className="hero-bubble pro" aria-hidden="true">이건 편하겠다!</p>
        <p className="hero-bubble con" aria-hidden="true">잠깡, 이것도 보자!</p>
      </div>
      <p className="hero-tagline"><span aria-hidden="true">✦</span> 좋은 점과 불편한 점을 함께 살펴보는 가전 청문회 <span aria-hidden="true">✦</span></p>
    </section>
    <section className="intro" id="intake">
      <form className="intro-form" onSubmit={handleSubmit} noValidate>
        <h2>어떤 제품이 고민이야?</h2>
        <p className="muted">제품만 고르면 살깡이와 말깡이가 공방을 시작해요</p>
        <fieldset className="chips" disabled={busy}>
          <legend>1. 제품군</legend>
          {CATEGORIES.map((c) => (
            <label key={c.id} className="chip">
              <input type="radio" name="category" value={c.id} checked={input.category === c.id}
                onChange={() => { setLoading(true); setCatalogError(false); setBrand(''); change({ ...input, category: c.id, catalog_model: undefined }) }} />
              {c.label}
            </label>
          ))}
        </fieldset>
        <p className="field-error">{shown.category}</p>

        {manual ? <>
        <label htmlFor="product_text">제품 링크 또는 제품 정보</label>
        <textarea
          id="product_text"
          rows={3}
          maxLength={5000}
          placeholder="모델명·사양을 붙여넣거나 제품 정보를 입력하세요"
          value={input.product_text}
          aria-invalid={!!shown.product_text}
          aria-describedby="product_text_err"
          onChange={(e) => change({ ...input, product_text: e.target.value, catalog_model: undefined })}
        />
        <p id="product_text_err" className="field-error">{shown.product_text}</p>
        </> : <>
          <fieldset className="model-pick" disabled={busy || loading} aria-describedby="catalog_model_err">
            <legend>2. 제품 모델</legend>
            {brands.length > 1 && <div className="brand-filter" role="group" aria-label="브랜드로 좁히기">
              {['', ...brands].map((b) => (
                <button key={b || 'all'} type="button" className="chip" aria-pressed={brand === b} onClick={() => setBrand(b)}>{b || '전체'}</button>
              ))}
            </div>}
            <div className="model-list">
              {products.filter((p) => !brand || p.brand === brand).map((p) => (
                <label key={p.model} className="model-card">
                  <input type="radio" name="catalog_model" value={p.model} checked={input.catalog_model === p.model}
                    onChange={() => change({ ...input, catalog_model: p.model })} />
                  <span className="model-name">{p.name}{p.variant ? ` [${p.variant}]` : ''}</span>
                  <span className="muted small">{p.brand} · {p.model}{p.status === '단종' ? ' · 단종' : ''}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p id="catalog_model_err" className="field-error">{shown.catalog_model}</p>
          {products.find((p) => p.model === input.catalog_model)?.status === '단종' && <p className="catalog-note"><span className="tag outline">단종</span> 판매·지원 여부를 별도로 확인해 주세요.</p>}
          {loading && <p className="muted catalog-note" role="status">제품 목록을 불러오는 중이에요…</p>}
          {!loading && (catalogError || products.length === 0) && <div className="catalog-note" role="status">
            <p>{catalogError ? '제품 목록을 불러오지 못했어요.' : '등록된 제품이 없어요.'} 링크나 제품 정보로 시작할 수 있어요.</p>
            <button type="button" className="link" onClick={() => { setLoading(true); setCatalogError(false); setRetry(retry + 1) }}>목록 다시 불러오기</button>
          </div>}
        </>}
        <button type="button" className="link catalog-mode" disabled={busy} onClick={() => {
          setManual(!manual)
          change({ ...input, catalog_model: undefined })
        }}>{manual ? '카탈로그에서 고르기' : '목록에 없어요 · 직접 입력하기'}</button>

        <details className="reason-fold" open={!!input.reason}>
          <summary>+ 구매 이유 적기 <span className="muted small">(선택)</span></summary>
          <label htmlFor="reason" className="sr-only">구매 이유</label>
          <input
            id="reason"
            maxLength={200}
            placeholder="예: 퇴근 후 청소 부담을 줄이고 싶어요"
            value={input.reason}
            aria-invalid={!!shown.reason}
            aria-describedby="reason_err"
            onChange={(e) => change({ ...input, reason: e.target.value })}
          />
          <p id="reason_err" className="field-error">{shown.reason}</p>
        </details>

        {message && <p className="form-error" role="alert">{message}</p>}

        <div className="actions">
          <button type="submit" className="primary" disabled={busy}>
            {busy ? '확인 중…' : manual ? '제품 정보 확인하기 →' : '청문회 시작하기 →'}
          </button>
          <button type="button" className="secondary" onClick={onExample} disabled={busy}>
            예시로 먼저 체험하기
          </button>
        </div>
      </form>

    </section>
    </>
  )
}
