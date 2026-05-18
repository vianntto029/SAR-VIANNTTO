import { useEffect, useRef } from 'react'

const BEIGE = '#CDB3A7'
const GRAY = '#A6A6A6'

const FINAL_COLOR = {
  'v-left': BEIGE, 'v-right': BEIGE, 'v-main': BEIGE,
  'letter-i': GRAY, 'letter-a': GRAY, 'letter-a-tip': GRAY,
  'letter-n1': GRAY, 'letter-n2': GRAY,
  'letter-t1': GRAY, 'letter-t2': GRAY, 'letter-o': GRAY,
}

const DRAW_SEQ = [
  { id: 'v-main', type: 'shape', delay: 0.0, dur: 2.2 },
  { id: 'v-left', type: 'shape', delay: 0.4, dur: 1.8 },
  { id: 'v-right', type: 'shape', delay: 0.7, dur: 1.5 },
  { id: 'letter-i', type: 'shape', delay: 2.8, dur: 0.9 },
  { id: 'letter-a', type: 'shape', delay: 3.1, dur: 1.3 },
  { id: 'letter-a-tip', type: 'detail', delay: 3.1, dur: 1.3 },
  { id: 'letter-n1', type: 'shape', delay: 3.6, dur: 1.3 },
  { id: 'letter-n2', type: 'shape', delay: 4.0, dur: 1.3 },
  { id: 'letter-t1', type: 'shape', delay: 4.4, dur: 1.1 },
  { id: 'letter-t2', type: 'shape', delay: 4.7, dur: 1.1 },
  { id: 'letter-o', type: 'shape', delay: 5.1, dur: 1.5 },
]

const UNDRAW_START = 8.0
const UNDRAW_SEQ = [
  { id: 'letter-o', type: 'shape', delay: 0.0, dur: 1.0 },
  { id: 'letter-t2', type: 'shape', delay: 0.2, dur: 0.8 },
  { id: 'letter-t1', type: 'shape', delay: 0.4, dur: 0.8 },
  { id: 'letter-n2', type: 'shape', delay: 0.6, dur: 0.8 },
  { id: 'letter-n1', type: 'shape', delay: 0.8, dur: 0.8 },
  { id: 'letter-a', type: 'shape', delay: 1.1, dur: 0.8 },
  { id: 'letter-a-tip', type: 'detail', delay: 1.1, dur: 0.8 },
  { id: 'letter-i', type: 'shape', delay: 1.3, dur: 0.6 },
  { id: 'v-right', type: 'shape', delay: 2.0, dur: 1.0 },
  { id: 'v-left', type: 'shape', delay: 2.2, dur: 1.2 },
  { id: 'v-main', type: 'shape', delay: 2.4, dur: 1.5 },
]

const DRAW_EASE = 'cubic-bezier(0.16, 0.8, 0.3, 1)'
const FADE_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

function toTransparent(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},0)`
}

function animateTraceAndFill(el, totalLen, opts) {
  const delayMs = opts.delay * 1000
  const durMs = opts.dur * 1000
  const color = opts.color
  const trans = toTransparent(color)

  el.style.fill = trans
  el.style.stroke = color
  el.style.strokeWidth = '2px'
  el.style.strokeLinecap = 'round'
  el.style.strokeLinejoin = 'round'
  el.style.strokeDasharray = `${totalLen}px`
  el.style.strokeDashoffset = `${totalLen}px`
  el.style.opacity = '0'

  el.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 300, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ strokeDashoffset: `${totalLen}px` }, { strokeDashoffset: '0px' }],
    { duration: durMs, delay: delayMs, easing: DRAW_EASE, fill: 'forwards' }
  )
  const fillDelay = delayMs + durMs * 0.62
  const fillDur = durMs * 0.5
  el.animate(
    [{ fill: trans }, { fill: color }],
    { duration: fillDur, delay: fillDelay, easing: FADE_EASE, fill: 'forwards' }
  )
  const sfDelay = delayMs + durMs * 0.82
  const sfDur = durMs * 0.35
  el.animate(
    [{ strokeWidth: '2px' }, { strokeWidth: '0px' }],
    { duration: sfDur, delay: sfDelay, easing: FADE_EASE, fill: 'forwards' }
  )
}

function animateDetail(el, opts) {
  const delayMs = opts.delay * 1000
  const durMs = opts.dur * 1000
  const color = opts.color

  el.style.fill = 'none'
  el.style.stroke = 'none'
  el.style.opacity = '0'

  const fadeDelay = delayMs + durMs * 0.65
  el.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: durMs * 0.4, delay: fadeDelay, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ fill: toTransparent(color) }, { fill: color }],
    { duration: durMs * 0.4, delay: fadeDelay, easing: FADE_EASE, fill: 'forwards' }
  )
}

function animateUndraw(el, opts, globalStart) {
  const delayMs = (globalStart + opts.delay) * 1000
  const durMs = opts.dur * 1000
  const color = opts.color

  el.animate(
    [{ strokeWidth: '0px' }, { strokeWidth: '2px' }],
    { duration: durMs * 0.15, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ fill: color }, { fill: toTransparent(color) }],
    { duration: durMs * 0.4, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ strokeDashoffset: '0px' }, { strokeDashoffset: '1px' }],
    { duration: durMs, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 250, delay: delayMs + durMs * 0.85, easing: FADE_EASE, fill: 'forwards' }
  )
}

function animateDetailUndraw(el, opts, globalStart) {
  const delayMs = (globalStart + opts.delay) * 1000
  const durMs = opts.dur * 1000
  const color = opts.color

  el.animate(
    [{ fill: color }, { fill: toTransparent(color) }],
    { duration: durMs * 0.4, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
  el.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: durMs * 0.4, delay: delayMs, easing: FADE_EASE, fill: 'forwards' }
  )
}

export default function ViannttoSplash({ onComplete }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const allIds = Object.keys(FINAL_COLOR)
    allIds.forEach(id => {
      const el = svg.querySelector(`#${id}`)
      if (el) {
        el.getAnimations().forEach(a => a.cancel())
        el.style.cssText = ''
        el.setAttribute('fill', 'none')
        el.setAttribute('stroke', 'none')
      }
    })
    svg.getBoundingClientRect()
    allIds.forEach(id => {
      const el = svg.querySelector(`#${id}`)
      if (el) el.setAttribute('pathLength', '1')
    })

    DRAW_SEQ.forEach(s => {
      const el = svg.querySelector(`#${s.id}`)
      if (!el) return
      const color = FINAL_COLOR[s.id]
      if (s.type === 'detail') {
        animateDetail(el, { delay: s.delay, dur: s.dur, color })
      } else {
        animateTraceAndFill(el, 1, { delay: s.delay, dur: s.dur, color })
      }
    })

    UNDRAW_SEQ.forEach(s => {
      const el = svg.querySelector(`#${s.id}`)
      if (!el) return
      const color = FINAL_COLOR[s.id]
      if (s.type === 'detail') {
        animateDetailUndraw(el, s, UNDRAW_START)
      } else {
        animateUndraw(el, s, UNDRAW_START)
      }
    })

    const timer = setTimeout(() => {
      onComplete?.()
    }, (UNDRAW_START + 4) * 1000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
    }}>
      <div style={{ width: 'min(700px, 85vw)' }}>
        <svg ref={svgRef} viewBox="-60 -506 1245 1245" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
          <path id="v-left" fill="none" stroke="none" d="M104.64,160.06L55.27,34.49c-3.85-9.78-13.29-16.22-23.8-16.22l65.62,162.45,7.55-20.65Z"/>
          <path id="v-right" fill="none" stroke="none" d="M123.32,109.54L86.95,17.04C83.11,7.26,73.33,0,62.82,0l52.47,129.89,8.03-20.35Z"/>
          <path id="v-main" fill="none" stroke="none" d="M74.9,227.71L0,43.99h0c11.61,0,22.05,7.09,26.34,17.88l57.79,145.65L159.79,18.27c1.04-2.44,3.13-7.47,10.28-12.14C177.26,1.44,185.05-.03,187.7,0c-30.93,75.63-63.53,152.08-94.47,227.71-1.52,3.73-5.14,6.17-9.17,6.17h0c-4.02,0-7.65-2.44-9.17-6.16Z"/>
          <path id="letter-i" fill="none" stroke="none" d="M224.59,0v141.41c0,7.92,6.42,14.35,14.35,14.35V14.35C238.94,6.43,232.51,0,224.59,0Z"/>
          <path id="letter-a-tip" fill="none" stroke="none" d="M312.08,105.31L316.86,92.76L314.44,99.04Z"/>
          <path id="letter-a" fill="none" stroke="none" d="M345.29,0c-3.99,0-7.56,2.44-9.03,6.14l-58.48,148.45c9.2,0,17.46-5.66,20.77-14.25l18.3-47.59,28.39-74.02,28.39,74.02,18.22,47.48c3.3,8.64,11.59,14.35,20.85,14.35L354.32,6.15C352.86,2.44,349.28,0,345.29,0Z"/>
          <path id="letter-n1" fill="none" stroke="none" d="M542.09,13.33v114.3L465.04,4.09c-1.62-2.54-3.63-4.08-6.64-4.08h-.79c-4.88,0-8.82,3.95-8.82,8.82v145.83h2.22c7.36,0,11.11-5.97,11.11-13.33V24.04l77.04,123.37c1.62,2.54,4.42,4.08,7.44,4.08,4.88,0,8.83-3.95,8.83-8.83l.55-139.39V0c-7.36,0-13.88,5.97-13.88,13.33Z"/>
          <path id="letter-n2" fill="none" stroke="none" d="M695.45,13.33v114.3L618.4,4.09c-1.61-2.54-3.11-4.08-6.13-4.08h-1.31c-4.88,0-8.82,3.95-8.82,8.82v145.83h2.22c7.36,0,11.11-5.97,11.11-13.33V24.04l77.04,123.37c1.62,2.54,4.42,4.08,7.44,4.08,4.88,0,8.83-3.95,8.83-8.83V0c-7.36,0-13.33,5.97-13.33,13.33Z"/>
          <path id="letter-t1" fill="none" stroke="none" d="M748.13,12.94h42.8v141.72c7.15,0,12.94-6.38,12.94-14.25V12.94h31.23c6.48,0,11.74-5.79,11.74-12.93h-86.97c-6.48,0-11.74,5.79-11.74,12.93Z"/>
          <path id="letter-t2" fill="none" stroke="none" d="M860.82,12.94h42.8v141.72c7.15,0,12.94-6.38,12.94-14.25V12.94h31.23c6.48,0,11.75-5.79,11.75-12.93h-86.97c-6.48,0-11.74,5.79-11.74,12.93Z"/>
          <path id="letter-o" fill="none" stroke="none" d="M1119.2,47.16c-3.88-9.33-9.26-17.54-16.12-24.62-6.87-7.08-14.85-12.6-23.94-16.58C1070.04,1.99,1060.29,0,1049.87,0s-20.18,1.99-29.27,5.96c-9.09,3.97-17.07,9.5-23.93,16.58-6.87,7.08-12.24,15.28-16.13,24.62-3.88,9.34-5.82,19.39-5.82,30.17s1.94,20.76,5.82,30.13c3.88,9.36,9.26,17.59,16.13,24.66,6.87,7.08,14.84,12.6,23.93,16.58,9.1,3.98,18.85,5.96,29.27,5.96s20.17-1.99,29.27-5.96c9.09-3.97,17.07-9.5,23.94-16.58,6.87-7.08,12.24-15.3,16.12-24.66,3.88-9.36,5.83-19.41,5.83-30.13s-1.95-20.84-5.83-30.17ZM1105.61,102.44c-3.07,7.77-7.37,14.57-12.87,20.42-5.51,5.84-11.91,10.39-19.2,13.64-7.29,3.25-15.18,4.88-23.67,4.88s-16.39-1.63-23.72-4.88c-7.32-3.25-13.71-7.8-19.19-13.64-5.49-5.84-9.77-12.65-12.87-20.42-3.1-7.77-4.65-16.14-4.65-25.11s1.55-17.34,4.65-25.11c3.1-7.77,7.39-14.57,12.87-20.42,5.48-5.84,11.87-10.39,19.19-13.64,7.32-3.25,15.22-4.88,23.72-4.88s16.38,1.63,23.67,4.88c7.28,3.25,13.69,7.8,19.2,13.64,5.51,5.84,9.8,12.65,12.87,20.42,3.07,7.77,4.6,16.14,4.6,25.11s-1.53,17.34-4.6,25.11Z"/>
        </svg>
      </div>
    </div>
  )
}
