'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Maximize, Minimize } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ScorecardPage() {
  const { data, isLoading } = useSWR('/api/scorecard', fetcher, { refreshInterval: 15000 })
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err))
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
  
  useEffect(() => {
    if (!data?.groups?.length) return
    const totalPages = Math.ceil(data.groups.length / 6)
    if (totalPages <= 1) return

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 15000)
    
    return () => clearInterval(interval)
  }, [data])

  if (isLoading || !data) {
    return <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center text-white font-bold text-2xl">Loading Scorecard...</div>
  }

  const { groups, programs, results } = data
  
  const chunkedGroups = []
  for (let i = 0; i < groups.length; i += 6) {
    chunkedGroups.push(groups.slice(i, i + 6))
  }
  const currentGroups = chunkedGroups[currentPage] || []

  // Helper to get score for a group in a program
  const getScore = (groupId: string, programId: string) => {
    const groupResults = results.filter((r: any) => r.groupId === groupId && r.programId === programId)
    return groupResults.reduce((sum: number, r: any) => sum + r.pointsAwarded, 0)
  }

  return (
    <div className="min-h-screen bg-indigo-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 md:p-6 lg:p-8 shrink-0 flex justify-center items-center border-b border-indigo-500/30 bg-indigo-950 shadow-lg relative z-10">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#FFFF00] uppercase tracking-wide leading-tight drop-shadow-md">
            St. Francis English Medium School, Kundayithode
          </h1>
          <div className="text-white/90 font-semibold text-xl md:text-2xl lg:text-3xl tracking-widest uppercase mt-1">
            RANGOLSAV 2026 - CATEGORY II SCORECARD
          </div>
        </div>
        <div className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
          {chunkedGroups.length > 1 && (
            <div className="text-[#FFFF00] font-bold bg-[#FFFF00]/10 px-4 py-2 rounded-xl border border-[#FFFF00]/30">
              Page {currentPage + 1} / {chunkedGroups.length}
            </div>
          )}
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content - Matrix Table */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="inline-block min-w-full"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-indigo-950/95 backdrop-blur border-b-4 border-r-4 border-indigo-500/50 p-4 text-left font-black text-xl text-white shadow-xl min-w-[250px]">
                    GROUP
                  </th>
                  {programs.map((p: any) => (
                    <th key={p.id} className="border-b-4 border-indigo-500/50 p-4 font-bold text-sm text-indigo-200 whitespace-nowrap min-w-[120px] max-w-[200px] truncate" title={p.name}>
                      {p.name}
                    </th>
                  ))}
                  <th className="sticky right-0 z-20 bg-indigo-950/95 backdrop-blur border-b-4 border-l-4 border-indigo-500/50 p-4 text-center font-black text-xl text-[#FFFF00] shadow-xl">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentGroups.map((g: any, idx: number) => (
                  <tr key={g.id} className={idx % 2 === 0 ? 'bg-white/5 hover:bg-white/10 transition-colors' : 'bg-transparent hover:bg-white/10 transition-colors'}>
                    <td className="sticky left-0 z-20 bg-indigo-950/95 backdrop-blur border-r-4 border-indigo-500/50 p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        {g.logoUrl ? (
                          <img src={g.logoUrl} alt="logo" className="w-8 h-8 object-contain" />
                        ) : (
                          <Trophy className="w-6 h-6 text-[#FFFF00]" />
                        )}
                        <span className="font-black text-xl tracking-wider" style={{ color: g.colorCode || '#FFF' }}>
                          {g.name}
                        </span>
                      </div>
                    </td>
                    
                    {programs.map((p: any) => {
                      const score = getScore(g.id, p.id)
                      return (
                        <td key={p.id} className="p-4 text-center border-b border-white/5 text-lg font-semibold text-white/80">
                          {score > 0 ? (
                            <span className="bg-white/10 px-3 py-1 rounded border border-white/20 text-[#FFFF00]">{score}</span>
                          ) : (
                            <span className="text-white/20">-</span>
                          )}
                        </td>
                      )
                    })}
                    
                    <td className="sticky right-0 z-20 bg-indigo-950/95 backdrop-blur border-l-4 border-indigo-500/50 p-4 text-center shadow-xl">
                      <span className="font-black text-2xl text-[#FFFF00] bg-[#FFFF00]/10 px-4 py-1.5 rounded-lg border border-[#FFFF00]/30">
                        {g.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{__html: 
        ".custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } " +
        ".custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; } " +
        ".custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }"
      }} />
    </div>
  )
}
