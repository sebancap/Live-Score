'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ScorecardOverlay({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useSWR('/api/scorecard', fetcher)
  const [currentPage, setCurrentPage] = useState(0)
  
  useEffect(() => {
    if (!data?.groups?.length) return
    const totalPages = Math.ceil(data.groups.length / 6)
    
    let pagesShown = 0

    const interval = setInterval(() => {
      pagesShown++
      if (pagesShown >= totalPages) {
        clearInterval(interval)
        onClose()
      } else {
        setCurrentPage((prev) => (prev + 1) % totalPages)
      }
    }, 15000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.groups?.length])

  if (isLoading || !data) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-indigo-950 flex flex-col items-center justify-center text-white font-bold text-2xl"
      >
        Loading Scorecard...
      </motion.div>
    )
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
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 bg-indigo-950 text-white flex flex-col font-sans overflow-hidden"
    >
      {/* Header */}
      <header className="p-4 md:p-6 lg:p-8 shrink-0 flex justify-center items-center border-b border-indigo-500/30 bg-indigo-950 shadow-lg relative z-10">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#FFFF00] uppercase tracking-wide leading-tight drop-shadow-md">
            St. Francis English Medium School, Kundayithode
          </h1>
          <div className="text-white/90 font-semibold text-xl md:text-2xl lg:text-3xl tracking-widest uppercase mt-1">
            RANGOLSAV 2026 - CATEGORY II
          </div>
        </div>
        <div className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
          {chunkedGroups.length > 1 && (
            <div className="text-[#FFFF00] font-bold bg-[#FFFF00]/10 px-4 py-2 rounded-xl border border-[#FFFF00]/30">
              Page {currentPage + 1} / {chunkedGroups.length}
            </div>
          )}
          <button 
            onClick={onClose}
            className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-xl transition-all border border-red-500/30"
            title="Close Scorecard"
          >
            <X className="w-6 h-6" />
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
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-indigo-950/95 backdrop-blur border-b-4 border-r-4 border-indigo-500/50 p-2 md:p-3 text-left font-black text-sm md:text-base text-white shadow-xl w-[130px] md:w-[220px]">
                      GROUP
                    </th>
                    {programs.map((p: any) => {
                      const isLong = p.name.length > 18;
                      return (
                        <th key={p.id} className="border-b-4 border-indigo-500/50 px-1 align-bottom pb-2 relative z-30" title={p.name}>
                          <div className="h-[140px] md:h-[180px] relative w-full overflow-visible">
                            <div className={`absolute bottom-0 left-1/2 origin-bottom-left transform -rotate-[60deg] -ml-2 mb-2 font-bold text-indigo-100 whitespace-nowrap tracking-wider truncate ${isLong ? 'text-[10px] md:text-xs w-[120px] md:w-[155px]' : 'text-[11px] md:text-sm w-[110px] md:w-[140px]'}`}>
                              {p.name}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="sticky right-0 z-20 bg-indigo-950/95 backdrop-blur border-b-4 border-l-4 border-indigo-500/50 p-2 md:p-3 text-center font-black text-sm md:text-base text-[#FFFF00] shadow-xl w-[60px] md:w-[80px]">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentGroups.map((g: any, idx: number) => (
                    <tr key={g.id} className={idx % 2 === 0 ? 'bg-white/5 hover:bg-white/10 transition-colors' : 'bg-transparent hover:bg-white/10 transition-colors'}>
                      <td className="sticky left-0 z-20 bg-indigo-950/95 backdrop-blur border-r-4 border-indigo-500/50 p-2 shadow-xl w-[130px] md:w-[160px]">
                        <div className="flex items-start md:items-center gap-2 h-full">
                          {g.logoUrl ? (
                            <img src={g.logoUrl} alt="logo" className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0 mt-0.5 md:mt-0" />
                          ) : (
                            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#FFFF00] shrink-0 mt-0.5 md:mt-0" />
                          )}
                          <span className="font-black text-[11px] md:text-[13px] lg:text-[15px] tracking-wide whitespace-normal break-words leading-tight" style={{ color: g.colorCode || '#FFF' }}>
                            {g.name}
                          </span>
                        </div>
                      </td>
                      
                      {programs.map((p: any) => {
                        const score = getScore(g.id, p.id)
                        return (
                          <td key={p.id} className="p-1 md:p-2 text-center border-b border-white/5 text-xs md:text-sm font-semibold text-white/80">
                            {score > 0 ? (
                              <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-[#FFFF00]">{score}</span>
                            ) : (
                              <span className="text-white/20">-</span>
                            )}
                          </td>
                        )
                      })}
                      
                      <td className="sticky right-0 z-20 bg-indigo-950/95 backdrop-blur border-l-4 border-indigo-500/50 p-2 md:p-3 text-center shadow-xl w-[60px] md:w-[80px]">
                        <span className="text-base md:text-xl font-extrabold text-[#FFFF00] drop-shadow-md">
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
    </motion.div>
  )
}
