import { useEffect } from 'react'

const sampleDuration = 1_600

export function useStoryPerformanceAudit(scene: string): void {
  useEffect(() => {
    const enabled = new URLSearchParams(window.location.search).get('perf') === '1'
    if (!enabled) return

    const startedAt = performance.now()
    let previousFrame = startedAt
    let animationFrame = 0
    let frameCount = 0
    let worstFrameMs = 0
    let frameGapsOver50Ms = 0
    const longTasks: number[] = []

    const observer = typeof PerformanceObserver === 'undefined'
      ? undefined
      : new PerformanceObserver((entries) => {
          for (const entry of entries.getEntries()) {
            if (entry.startTime >= startedAt) longTasks.push(entry.duration)
          }
        })

    try {
      observer?.observe({ type: 'longtask', buffered: true })
    } catch {
      observer?.disconnect()
    }

    function sampleFrame(now: number) {
      const frameTime = now - previousFrame
      previousFrame = now
      frameCount += 1
      worstFrameMs = Math.max(worstFrameMs, frameTime)
      if (frameTime > 50) frameGapsOver50Ms += 1

      if (now - startedAt < sampleDuration) {
        animationFrame = window.requestAnimationFrame(sampleFrame)
        return
      }

      observer?.disconnect()
      console.info('[story-perf]', JSON.stringify({
        scene,
        frames: frameCount,
        worstFrameMs: Number(worstFrameMs.toFixed(1)),
        frameGapsOver50Ms,
        longTasks: longTasks.length,
        worstLongTaskMs: Number(Math.max(0, ...longTasks).toFixed(1)),
      }))
    }

    animationFrame = window.requestAnimationFrame(sampleFrame)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      observer?.disconnect()
    }
  }, [scene])
}
