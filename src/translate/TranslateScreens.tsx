import { useEffect, useMemo, useState } from 'react'
import {
  CaretDown,
  ArrowsLeftRight,
  ClockCounterClockwise,
  Copy,
  FileText,
  Image,
  Keyboard,
  Microphone,
  ShareNetwork,
  SpeakerHigh,
  Translate,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Gnb, Header, Phone } from '../shell'
import { DocFileIcon, DocMode, ImageMode, LangPicker, TalkMode, VoiceMode, docKind } from './TranslateModes'
import {
  MAX_CHARS,
  SAMPLE_DOCS,
  SAMPLE_HISTORY,
  SAMPLE_TALKS,
  TARGET_LANGS,
  detectLang,
  langOf,
  translateText,
  type LangId,
  type TalkLine,
} from './data'
import '../translate.css'

const PH = { weight: 'regular' as const }

type ExtraMode = 'voice' | 'talk' | 'image' | 'doc'

type HistMode = 'text' | 'voice'

type HistItem = { src: string; dst: string; from: LangId; to: string; mode?: HistMode }

type RecentDoc = { name: string; from: LangId; to: string; at: number }

type RecentTalk = { id: number; from: LangId; to: string; at: number; lines: TalkLine[] }

type RecentTab = 'text' | 'talk' | 'doc'

const RECENT_TABS: { id: RecentTab; label: string }[] = [
  { id: 'text', label: '번역' },
  { id: 'talk', label: '대화' },
  { id: 'doc', label: '문서' },
]

const DOC_KEY = 'tomatalk-translate-docs'
const TALK_KEY = 'tomatalk-translate-talks'
const DAY = 24 * 60 * 60 * 1000

function loadList<T>(key: string, ok: (v: T) => boolean, fallback: () => T[]): T[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]') as T[]
    const items = Array.isArray(parsed) ? parsed.filter(ok) : []
    return items.length ? items : fallback()
  } catch {
    return fallback()
  }
}

function saveList(key: string, items: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

function shortDate(at: number) {
  const d = new Date(at)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

const EXTRA_MODES: { id: ExtraMode; label: string; Icon: Icon; hint: string }[] = [
  { id: 'voice', label: '음성', Icon: Microphone, hint: '마이크를 눌러 말하면 바로 번역돼요' },
  { id: 'talk', label: '번역 대화', Icon: ArrowsLeftRight, hint: '양쪽 언어로 번갈아 대화할 수 있어요' },
  { id: 'image', label: '이미지', Icon: Image, hint: '사진 속 글자를 읽어 번역해요' },
  { id: 'doc', label: '문서', Icon: FileText, hint: '문서를 올리면 내용을 번역해요' },
]

type SpeakSide = 'in' | 'out'

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

export function ServicesHome() {
  const nav = useNavigate()
  return (
    <Phone>
      <Header title="서비스" />
      <div className="phone-scroll">
        <div className="tr-page">
          <div className="tr-list">
            <button type="button" className="tr-svc" onClick={() => nav('/services/translate')}>
              <span className="tr-svc-ico">
                <Translate size={22} {...PH} />
              </span>
              <span>
                <b>기본번역</b>
              </span>
            </button>
          </div>
        </div>
      </div>
      <Gnb />
    </Phone>
  )
}

export function TranslateScreen() {
  const nav = useNavigate()
  const [from, setFrom] = useState<LangId>('auto')
  const [to, setTo] = useState('en')
  const [input, setInput] = useState('')
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const [mode, setMode] = useState<ExtraMode | null>(null)
  const [speaking, setSpeaking] = useState<SpeakSide | null>(null)
  const [history, setHistory] = useState<HistItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('tomatalk-translate-history-v2')
      const parsed = saved ? (JSON.parse(saved) as HistItem[]) : []
      const items = Array.isArray(parsed) ? parsed.filter((h) => h.src && h.dst) : []
      return items.length ? items : SAMPLE_HISTORY
    } catch {
      return SAMPLE_HISTORY
    }
  })
  const [showRecent, setShowRecent] = useState(false)
  const [voiceSeed, setVoiceSeed] = useState('')
  const [talkSeed, setTalkSeed] = useState<{ id: number; lines: TalkLine[] } | null>(null)
  const [docSeed, setDocSeed] = useState('')
  const [recentTab, setRecentTab] = useState<RecentTab>('text')
  const [docs, setDocs] = useState<RecentDoc[]>(() =>
    loadList<RecentDoc>(
      DOC_KEY,
      (d) => !!d?.name,
      () => SAMPLE_DOCS.map((d) => ({ name: d.name, from: d.from, to: d.to, at: Date.now() - d.daysAgo * DAY })),
    ),
  )
  const [talks, setTalks] = useState<RecentTalk[]>(() =>
    loadList<RecentTalk>(
      TALK_KEY,
      (t) => Array.isArray(t?.lines) && t.lines.length > 0,
      () =>
        SAMPLE_TALKS.map((t, i) => ({
          id: i + 1,
          from: t.from,
          to: t.to,
          at: Date.now() - t.daysAgo * DAY,
          lines: t.lines,
        })),
    ),
  )

  useEffect(() => saveList(DOC_KEY, docs), [docs])
  useEffect(() => saveList(TALK_KEY, talks), [talks])

  const openRecent = () => {
    setRecentTab(mode === 'talk' ? 'talk' : mode === 'doc' ? 'doc' : 'text')
    setShowRecent(true)
  }

  const enterMode = (next: ExtraMode | null) => {
    setVoiceSeed('')
    setTalkSeed(next === 'talk' ? { id: talks.reduce((m, t) => Math.max(m, t.id), 0) + 1, lines: [] } : null)
    setDocSeed('')
    setMode(next)
  }

  const rememberDoc = (name: string) => {
    setDocs((cur) => [{ name, from: source, to, at: Date.now() }, ...cur.filter((d) => d.name !== name)].slice(0, 20))
  }

  const rememberTalk = (id: number, lines: TalkLine[]) => {
    setTalkSeed({ id, lines })
    setTalks((cur) => [{ id, from: source, to, at: Date.now(), lines }, ...cur.filter((t) => t.id !== id)].slice(0, 20))
  }
  const [inputFocused, setInputFocused] = useState(false)
  const detected = useMemo(() => (input.trim() ? detectLang(input) : 'ko'), [input])
  const source = from === 'auto' ? detected : from
  const output = useMemo(() => translateText(input, from, to), [input, from, to])
  const fromLabel = from === 'auto' ? (input.trim() ? langOf(detected).name : '언어 감지') : langOf(from).name

  useEffect(() => {
    if (from !== 'auto' && from === to) {
      const next = TARGET_LANGS.find((l) => l.id !== from)?.id
      if (next && next !== 'auto') setTo(next)
    }
  }, [from, to])

  useEffect(() => {
    return () => {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
    }
  }, [])

  const toggleSpeak = (side: SpeakSide, text: string, lang: LangId) => {
    if (!text || typeof speechSynthesis === 'undefined') return
    if (speaking === side) {
      speechSynthesis.cancel()
      setSpeaking(null)
      return
    }
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = langOf(lang === 'auto' ? detectLang(text) : lang).tts || 'ko-KR'
    u.onend = () => setSpeaking((cur) => (cur === side ? null : cur))
    u.onerror = () => setSpeaking((cur) => (cur === side ? null : cur))
    setSpeaking(side)
    speechSynthesis.speak(u)
  }

  const shareText = async (text: string) => {
    if (!text.trim()) return
    try {
      if (navigator.share) await navigator.share({ text })
      else await copyText(text)
    } catch {
      /* ignore */
    }
  }

  const shareOutput = async () => {
    await shareText(output)
  }

  const swap = () => {
    const nextFrom = to
    const nextTo = source === 'auto' ? 'en' : source
    setFrom(nextFrom)
    setTo(nextTo === 'auto' ? 'en' : nextTo)
    setInput(output || input)
  }

  const pickLang = (id: LangId) => {
    if (picker === 'from') setFrom(id)
    if (picker === 'to' && id !== 'auto') setTo(id)
    setPicker(null)
  }

  const remember = (src: string, dst: string, mode: HistMode = 'text') => {
    if (!src.trim() || !dst.trim()) return
    setHistory((cur) =>
      [{ src, dst, from: source, to, mode }, ...cur.filter((h) => h.src !== src || h.dst !== dst)].slice(0, 50),
    )
  }

  useEffect(() => {
    if (!input.trim() || !output.trim()) return
    const t = window.setTimeout(() => remember(input, output), 400)
    return () => window.clearTimeout(t)
  }, [input, output])

  useEffect(() => {
    try {
      window.localStorage.setItem('tomatalk-translate-history-v2', JSON.stringify(history))
    } catch {
      /* ignore */
    }
  }, [history])

  const typed = input.trim()
  const recent = history

  const modeDock = (current: ExtraMode | null) => (
    <div className="tr-dock" role="toolbar" aria-label="번역 도구">
      {EXTRA_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`tr-dock-btn ${m.id}${current === m.id ? ' on' : ''}`}
          aria-pressed={current === m.id}
          onClick={() => enterMode(current === m.id ? null : m.id)}
        >
          <span className="tr-dock-icon">
            <m.Icon size={20} {...PH} />
          </span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )

  if (showRecent) {
    const close = () => setShowRecent(false)
    return (
      <Phone>
        <Header title="최근" onBack={close} />
        <div className="phone-scroll">
          <div className="tr-page">
            <div className="tr-seg" role="tablist" aria-label="최근 내역 종류">
              {RECENT_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={recentTab === t.id}
                  className={recentTab === t.id ? 'on' : ''}
                  onClick={() => setRecentTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {recentTab === 'text' ? (
              recent.length ? (
                <div>
                  {recent.map((h) => (
                    <button
                      key={`${h.src}-${h.dst}`}
                      type="button"
                      className="tr-hist-item"
                      onClick={() => {
                        setFrom(h.from)
                        setTo(h.to)
                        if (mode === 'voice') setVoiceSeed(h.src)
                        else {
                          setInput(h.src)
                          enterMode(null)
                        }
                        close()
                      }}
                    >
                      <span className="tr-hist-mode" aria-label={h.mode === 'voice' ? '음성' : '텍스트'}>
                        {h.mode === 'voice' ? <Microphone size={14} {...PH} /> : <Keyboard size={14} {...PH} />}
                      </span>
                      <span className="tr-hist-body">
                        <b>{h.src}</b>
                        <span>{h.dst}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="tr-thread-empty">없음</p>
              )
            ) : null}

            {recentTab === 'talk' ? (
              talks.length ? (
                <div>
                  {talks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="tr-hist-item"
                      onClick={() => {
                        setFrom(t.from)
                        setTo(t.to)
                        setTalkSeed({ id: t.id, lines: t.lines })
                        setVoiceSeed('')
                        setDocSeed('')
                        setMode('talk')
                        close()
                      }}
                    >
                      <span className="tr-hist-mode" aria-label="대화">
                        <ArrowsLeftRight size={14} {...PH} />
                      </span>
                      <span className="tr-hist-body">
                        <b>{t.lines[0]?.src}</b>
                        <span>
                          {t.lines.length}마디 · {langOf(t.from).name} ↔ {langOf(t.to).name} · {shortDate(t.at)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="tr-thread-empty">없음</p>
              )
            ) : null}

            {recentTab === 'doc' ? (
              docs.length ? (
                <div>
                  {docs.map((d) => (
                    <button
                      key={`${d.name}-${d.at}`}
                      type="button"
                      className="tr-hist-item"
                      onClick={() => {
                        setFrom(d.from)
                        setTo(d.to)
                        setDocSeed(d.name)
                        setVoiceSeed('')
                        setTalkSeed(null)
                        setMode('doc')
                        close()
                      }}
                    >
                      <span className={`tr-hist-mode tr-file-ico ${docKind(d.name)}`} aria-label="문서">
                        <DocFileIcon name={d.name} size={16} />
                      </span>
                      <span className="tr-hist-body">
                        <b>{d.name}</b>
                        <span>
                          {langOf(d.from).name} → {langOf(d.to).name} · {shortDate(d.at)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="tr-thread-empty">없음</p>
              )
            ) : null}
          </div>
        </div>
      </Phone>
    )
  }

  if (mode === 'voice') {
    return (
      <Phone>
        <VoiceMode
          from={from}
          to={to}
          onBack={() => enterMode(null)}
          onSwap={swap}
          onPick={setPicker}
          onResult={(src, dst) => {
            remember(src, dst, 'voice')
            setVoiceSeed(src)
          }}
          onRecent={openRecent}
          initialHeard={voiceSeed}
        />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'talk') {
    return (
      <Phone>
        <TalkMode
          key={talkSeed?.id ?? 0}
          from={from}
          to={to}
          onBack={() => enterMode(null)}
          onPick={setPicker}
          onSwap={swap}
          onRecent={openRecent}
          onLinesChange={(lines) => rememberTalk(talkSeed?.id ?? 0, lines)}
          initialLines={talkSeed?.lines}
        />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'image') {
    return (
      <Phone>
        <ImageMode from={from} to={to} onBack={() => setMode(null)} onPick={setPicker} onSwap={swap} />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  if (mode === 'doc') {
    return (
      <Phone>
        <DocMode
          key={docSeed}
          from={from}
          to={to}
          onBack={() => enterMode(null)}
          onPick={setPicker}
          onSwap={swap}
          onRecent={openRecent}
          onDone={(name) => {
            rememberDoc(name)
            setDocSeed(name)
          }}
          initialDoc={docSeed}
        />
        {picker ? (
          <LangPicker
            side={picker}
            from={from}
            to={to}
            onPick={pickLang}
            onClose={() => setPicker(null)}
          />
        ) : null}
      </Phone>
    )
  }

  return (
    <Phone>
      <Header
        title="기본번역"
        onBack={() => nav('/services')}
        right={
          <button type="button" className="icon-btn" aria-label="최근" onClick={openRecent}>
            <ClockCounterClockwise size={22} {...PH} />
          </button>
        }
      />
      <div className="phone-scroll">
        <div className="tr-page">
          <section className="tr-voice-card tr-text-card">
            <div className="tr-voice-section">
              <div className="tr-voice-head">
                <span>원문</span>
                <div className="tr-head-actions">
                  <button type="button" className="tr-voice-lang" onClick={() => setPicker('from')}>
                    {fromLabel}
                    <CaretDown size={12} weight="regular" />
                  </button>
                  {typed ? (
                    <button
                      type="button"
                      className="tr-icon"
                      aria-label="지우기"
                      onClick={() => {
                        if (speaking) {
                          speechSynthesis.cancel()
                          setSpeaking(null)
                        }
                        setInput('')
                      }}
                    >
                      <X size={16} {...PH} />
                    </button>
                  ) : null}
                </div>
              </div>
              <textarea
                className="tr-input tr-text-input"
                value={input}
                maxLength={MAX_CHARS}
                placeholder="번역할 내용을 입력하세요"
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              />
              <div className="tr-text-foot">
                <p className="tr-count">
                  {input.length} / {MAX_CHARS}
                </p>
                <div className="tr-card-tools">
                  <button type="button" className="tr-icon" aria-label="음성 입력" onClick={() => setMode('voice')}>
                    <Microphone size={18} {...PH} />
                  </button>
                  <button
                    type="button"
                    className={`tr-icon${speaking === 'in' ? ' on' : ''}`}
                    aria-label={speaking === 'in' ? '입력 듣기 끄기' : '입력 듣기'}
                    aria-pressed={speaking === 'in'}
                    disabled={!input.trim()}
                    onClick={() => toggleSpeak('in', input, source)}
                  >
                    <SpeakerHigh size={18} weight={speaking === 'in' ? 'fill' : 'regular'} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="입력 복사" disabled={!input.trim()} onClick={() => void copyText(input)}>
                    <Copy size={18} {...PH} />
                  </button>
                  <button type="button" className="tr-icon" aria-label="입력 공유" disabled={!input.trim()} onClick={() => void shareText(input)}>
                    <ShareNetwork size={18} {...PH} />
                  </button>
                </div>
              </div>
            </div>

            <div className="tr-voice-section result">
              <div className="tr-voice-head">
                <span>번역</span>
                <button type="button" className="tr-voice-lang" onClick={() => setPicker('to')}>
                  {langOf(to).name}
                  <CaretDown size={12} weight="regular" />
                </button>
              </div>
              <p className={`tr-result${output ? '' : ' tr-empty'}`}>{output || ''}</p>
              <div className="tr-card-tools">
                <button
                  type="button"
                  className={`tr-icon${speaking === 'out' ? ' on' : ''}`}
                  aria-label={speaking === 'out' ? '듣기 끄기' : '듣기'}
                  aria-pressed={speaking === 'out'}
                  disabled={!output.trim()}
                  onClick={() => toggleSpeak('out', output, to)}
                >
                  <SpeakerHigh size={18} weight={speaking === 'out' ? 'fill' : 'regular'} />
                </button>
                <button type="button" className="tr-icon" aria-label="복사" disabled={!output.trim()} onClick={() => void copyText(output)}>
                  <Copy size={18} {...PH} />
                </button>
                <button type="button" className="tr-icon" aria-label="공유" disabled={!output.trim()} onClick={() => void shareOutput()}>
                  <ShareNetwork size={18} {...PH} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {inputFocused ? null : modeDock(null)}

      {picker ? (
        <LangPicker
          side={picker}
          from={from}
          to={to}
          onPick={pickLang}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </Phone>
  )
}
