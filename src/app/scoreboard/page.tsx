'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Mic2, Star } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function EventResultDisplay({ event, isCompact = false }: { event: any, isCompact?: boolean }) {
  if (!event) return <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">Waiting for results...</div>

  return (
    <div className="flex flex-col h-full w-full">
      <div className={`text-center ${isCompact ? 'mb-3' : 'mb-6'} shrink-0`}>
        <div className="text-indigo-300 font-semibold tracking-wider text-xs uppercase mb-1">
          {event.program.category.name} • {event.program.type}
        </div>
        <h3 className={`${isCompact ? 'text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'} font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 leading-tight truncate`}>
          {event.program.name}
        </h3>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-2">
        {/* 1st Place */}
        {event.results.find((r:any) => r.rank === 1) && (() => {
          const r = event.results.find((res:any) => res.rank === 1)
          return (
            <div className={`bg-yellow-500/10 border border-yellow-500/30 rounded-xl ${isCompact ? 'p-2' : 'p-3'} flex items-center gap-4 transform scale-[1.02] shadow-[0_0_15px_rgba(234,179,8,0.15)] relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
              <div className="text-2xl font-black text-yellow-500 w-12 text-center">1st</div>
              {r.group.logoUrl && <img src={r.group.logoUrl} className="w-8 h-8 object-contain" alt="logo" />}
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-white truncate">{r.group.name}</div>
                {r.participant && <div className="text-yellow-200/80 text-xs truncate">#{r.participant.chestNumber} - {r.participant.name}</div>}
              </div>
              <div className="text-lg font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-lg">+{r.pointsAwarded}</div>
            </div>
          )
        })()}
        
        {/* 2nd Place */}
        {event.results.find((r:any) => r.rank === 2) && (() => {
          const r = event.results.find((res:any) => res.rank === 2)
          return (
            <div className={`bg-gray-400/10 border border-gray-400/30 rounded-xl ${isCompact ? 'p-2' : 'p-3'} flex items-center gap-3 ml-2`}>
              <div className="text-xl font-black text-gray-400 w-12 text-center">2nd</div>
              {r.group.logoUrl && <img src={r.group.logoUrl} className="w-6 h-6 object-contain" alt="logo" />}
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-white truncate">{r.group.name}</div>
                {r.participant && <div className="text-gray-300/80 text-xs truncate">#{r.participant.chestNumber} - {r.participant.name}</div>}
              </div>
              <div className="text-base font-bold text-gray-300 bg-gray-400/10 px-2 py-1 rounded-lg">+{r.pointsAwarded}</div>
            </div>
          )
        })()}

        {/* 3rd Place */}
        {event.results.find((r:any) => r.rank === 3) && (() => {
          const r = event.results.find((res:any) => res.rank === 3)
          return (
            <div className={`bg-orange-500/10 border border-orange-500/30 rounded-xl ${isCompact ? 'p-2' : 'p-3'} flex items-center gap-3 ml-4`}>
              <div className="text-lg font-black text-orange-400 w-12 text-center">3rd</div>
              {r.group.logoUrl && <img src={r.group.logoUrl} className="w-5 h-5 object-contain" alt="logo" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{r.group.name}</div>
                {r.participant && <div className="text-orange-200/80 text-xs truncate">#{r.participant.chestNumber} - {r.participant.name}</div>}
              </div>
              <div className="text-sm font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">+{r.pointsAwarded}</div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default function ScoreboardPage() {
  const { data, isLoading } = useSWR('/api/scoreboard', fetcher, { refreshInterval: 3000 })
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Process published results into events for the slideshow
  const publishedEvents = useMemo(() => {
    if (!data?.latestResults) return []
    // Group results by programId
    const eventsMap = new Map<string, any>()
    
    data.latestResults.forEach((res: any) => {
      if (!eventsMap.has(res.programId)) {
        eventsMap.set(res.programId, {
          program: res.program,
          results: []
        })
      }
      eventsMap.get(res.programId).results.push(res)
    })
    
    // Convert to array and sort by latest publish time inside each group (approximately)
    return Array.from(eventsMap.values())
  }, [data?.latestResults])

  useEffect(() => {
    if (publishedEvents.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % publishedEvents.length)
    }, 10000) // 10 second hold
    return () => clearInterval(interval)
  }, [publishedEvents.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-white bg-black">
        Loading LiveScore...
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-white bg-black">
        Error loading data.
      </div>
    )
  }

  const groups = data.groups || []
  const livePrograms = data.livePrograms || []

  // Top 4 for Podium
  const top4 = groups.slice(0, 4)
  const others = groups.slice(4)

  const maxPoints = top4[0]?.totalPoints > 0 ? top4[0].totalPoints : 1
  
  const getPillarHeight = (points: number, defaultPercent: number) => {
    if (top4[0]?.totalPoints === 0) return `${defaultPercent}%`
    const calculated = (points / maxPoints) * 85 // Max height is 85% for 1st place
    return `${Math.max(22, calculated)}%` // At least 22% height so the number fits properly
  }

  const sliderEvents = publishedEvents.length > 1 ? publishedEvents.slice(1) : []
  const currentEvent = sliderEvents[currentSlideIndex] || null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <header className="py-4 px-8 flex justify-between items-center border-b border-white/10 bg-black/40 backdrop-blur-md">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 uppercase tracking-wide truncate pr-4">
          St. Francis Higher Secondary School Thottada <span className="text-white/80 font-normal">| School Cultural Fest</span>
        </h1>
        <div className="flex items-center space-x-2 shrink-0 bg-red-600/20 px-4 py-1.5 rounded-full border border-red-500/30">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-bold tracking-widest text-red-500 uppercase text-sm">Live Score</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0">
        
        {/* Left Side: Overall Standings & Stages */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 min-h-0">
          
          {/* Overall Standing Container */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative flex-1 min-h-0 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 shrink-0">
              <Trophy className="text-yellow-500 w-7 h-7" /> Overall Standings
            </h2>
            
            {/* Podium */}
            <div className="flex justify-center items-end gap-1 md:gap-2 lg:gap-4 h-64 mb-4 shrink-0 overflow-x-auto custom-scrollbar pb-2 pt-2">
              {/* 1st Place */}
              {top4[0] && (
                <div className="flex flex-col items-center flex-1 min-w-[70px] h-full justify-end z-10">
                  {top4[0].logoUrl ? <img src={top4[0].logoUrl} className="w-10 h-10 lg:w-16 lg:h-16 mb-2 object-contain animate-bounce" alt="logo" /> : <Trophy className="text-yellow-400 w-8 h-8 lg:w-12 lg:h-12 mb-2 animate-bounce" />}
                  <div className="text-sm md:text-base lg:text-xl font-black mb-1 w-full text-center text-yellow-300 leading-tight break-words px-1">{top4[0].name}</div>
                  <div className="text-xl md:text-2xl lg:text-4xl font-extrabold mb-2">{top4[0].totalPoints}</div>
                  <div 
                    className="w-full rounded-t-xl flex justify-center pt-2 md:pt-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out border-t-4 border-white/50 relative overflow-hidden"
                    style={{ 
                      backgroundColor: top4[0].colorCode,
                      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(255,255,255,0.25))',
                      height: getPillarHeight(top4[0].totalPoints, 85) 
                    }}
                  >
                    <span className="text-2xl md:text-3xl lg:text-5xl font-black text-white/60 relative z-10">1</span>
                  </div>
                </div>
              )}
              {/* 2nd Place */}
              {top4[1] && (
                <div className="flex flex-col items-center flex-1 min-w-[70px] h-full justify-end">
                  {top4[1].logoUrl && <img src={top4[1].logoUrl} className="w-8 h-8 lg:w-12 lg:h-12 mb-2 object-contain" alt="logo" />}
                  <div className="text-xs md:text-sm lg:text-base font-bold mb-1 w-full text-center leading-tight break-words px-1 text-gray-100">{top4[1].name}</div>
                  <div className="text-lg md:text-xl lg:text-3xl font-extrabold text-gray-200 mb-2">{top4[1].totalPoints}</div>
                  <div 
                    className="w-full rounded-t-xl flex justify-center pt-2 md:pt-3 shadow-2xl transition-all duration-1000 ease-out border-t-4 border-white/30 relative overflow-hidden"
                    style={{ 
                      backgroundColor: top4[1].colorCode,
                      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(255,255,255,0.1))',
                      height: getPillarHeight(top4[1].totalPoints, 65) 
                    }}
                  >
                    <span className="text-xl md:text-2xl lg:text-4xl font-black text-white/50 relative z-10">2</span>
                  </div>
                </div>
              )}
              {/* 3rd Place */}
              {top4[2] && (
                <div className="flex flex-col items-center flex-1 min-w-[70px] h-full justify-end">
                  {top4[2].logoUrl && <img src={top4[2].logoUrl} className="w-8 h-8 lg:w-12 lg:h-12 mb-2 object-contain" alt="logo" />}
                  <div className="text-xs md:text-sm lg:text-base font-bold mb-1 w-full text-center leading-tight break-words px-1 text-gray-100">{top4[2].name}</div>
                  <div className="text-lg md:text-xl lg:text-3xl font-extrabold text-gray-200 mb-2">{top4[2].totalPoints}</div>
                  <div 
                    className="w-full rounded-t-xl flex justify-center pt-2 md:pt-3 shadow-2xl transition-all duration-1000 ease-out border-t-4 border-white/20 relative overflow-hidden"
                    style={{ 
                      backgroundColor: top4[2].colorCode,
                      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(255,255,255,0.05))',
                      height: getPillarHeight(top4[2].totalPoints, 45) 
                    }}
                  >
                    <span className="text-xl md:text-2xl lg:text-4xl font-black text-white/40 relative z-10">3</span>
                  </div>
                </div>
              )}
              {/* 4th Place */}
              {top4[3] && (
                <div className="flex flex-col items-center flex-1 min-w-[70px] h-full justify-end">
                  {top4[3].logoUrl && <img src={top4[3].logoUrl} className="w-8 h-8 lg:w-12 lg:h-12 mb-2 object-contain" alt="logo" />}
                  <div className="text-xs md:text-sm lg:text-base font-bold mb-1 w-full text-center leading-tight break-words px-1 text-gray-100">{top4[3].name}</div>
                  <div className="text-lg md:text-xl lg:text-3xl font-extrabold text-gray-200 mb-2">{top4[3].totalPoints}</div>
                  <div 
                    className="w-full rounded-t-xl flex justify-center pt-2 md:pt-3 shadow-2xl transition-all duration-1000 ease-out border-t-4 border-white/10 relative overflow-hidden"
                    style={{ 
                      backgroundColor: top4[3].colorCode,
                      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(255,255,255,0.02))',
                      height: getPillarHeight(top4[3].totalPoints, 25) 
                    }}
                  >
                    <span className="text-xl md:text-2xl lg:text-4xl font-black text-white/30 relative z-10">4</span>
                  </div>
                </div>
              )}
            </div>

            {/* Other Ranks */}
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2 mt-2">
              {others.map((group: any, idx: number) => (
                <div key={group.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-bold w-4 text-right text-lg">{idx + 5}</span>
                    {group.logoUrl ? (
                      <img src={group.logoUrl} className="w-8 h-8 object-contain" alt="logo" />
                    ) : (
                      <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: group.colorCode }} />
                    )}
                    <span className="font-bold text-lg">{group.name}</span>
                  </div>
                  <span className="font-black text-xl">{group.totalPoints} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Stages Container */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl h-48 shrink-0 flex flex-col">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-400">
              <Mic2 className="w-5 h-5" /> Live Stages
            </h2>
            <div className="flex-1 overflow-x-auto flex gap-4 custom-scrollbar pb-2">
              {livePrograms.length === 0 ? (
                <div className="text-gray-500 flex items-center justify-center w-full h-full italic">No programs currently live</div>
              ) : (
                livePrograms.map((prog: any) => (
                  <div key={prog.id} className="min-w-[200px] flex-1 bg-red-950/30 border border-red-500/20 rounded-xl p-4 flex flex-col justify-center">
                    <div className="text-red-400 font-bold text-sm mb-1 uppercase">{prog.stageName || 'Main Stage'}</div>
                    <div className="font-bold text-lg leading-tight mb-1 truncate" title={prog.name}>{prog.name}</div>
                    <div className="text-gray-400 text-xs flex justify-between">
                      <span>{prog.category?.name}</span>
                      <span>{prog.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Results */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 min-h-0">
          
          {/* Top Container: Latest Result (Static) */}
          <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-yellow-400 shrink-0">
              <Star className="w-5 h-5" /> Latest Announcement
            </h2>
            <div className="flex-1 relative">
              <EventResultDisplay event={publishedEvents[0]} isCompact={true} />
            </div>
          </div>

          {/* Bottom Container: Past Results (Slideshow) */}
          <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-300">
                <Star className="w-5 h-5 text-gray-400" /> Past Results
              </h2>
              {sliderEvents.length > 0 && (
                <div className="text-xs font-medium text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded-full border border-indigo-500/30">
                  {currentSlideIndex + 1} / {sliderEvents.length}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {currentEvent ? (
                  <motion.div
                    key={currentEvent.program.id}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <EventResultDisplay event={currentEvent} isCompact={true} />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
                    Waiting for past results...
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </main>

      {/* Ticker / Marquee at bottom */}
      {data.latestResults?.length > 0 && (
        <div className="h-10 bg-indigo-950 flex items-center overflow-hidden border-t border-indigo-500/30 whitespace-nowrap shrink-0">
          <motion.div 
            animate={{ x: [0, -2000] }} 
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex gap-12 items-center px-4"
          >
            {/* Duplicate for seamless loop */}
            {[...data.latestResults, ...data.latestResults].map((res: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 font-semibold text-white/80 text-sm">
                <span className="text-yellow-400 font-bold">{res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : '🥉'}</span>
                <span className="text-gray-400">[{res.program.category.name}]</span>
                <span className="text-white">{res.program.name}</span>
                <span className="text-indigo-300 mx-2">→</span>
                <span className="text-yellow-300 font-bold">{res.group.name}</span>
                {res.participant && <span className="text-white/60">({res.participant.name})</span>}
                <span className="text-indigo-400 mx-4">•</span>
              </div>
            ))}
          </motion.div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}} />
    </div>
  )
}
