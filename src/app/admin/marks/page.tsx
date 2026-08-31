'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CheckCircle, Edit, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MarkEntryPage() {
  const { data: programs } = useSWR('/api/programs', fetcher)
  const { data: groups } = useSWR('/api/groups', fetcher)
  const { data: categories } = useSWR('/api/categories', fetcher)
  
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedProg, setSelectedProg] = useState<any>(null)
  const { data: results, mutate: mutateResults } = useSWR(selectedProg ? `/api/results?programId=${selectedProg.id}` : null, fetcher)

  const [entryForm, setEntryForm] = useState({ chestNumber: '', name: '', groupId: '', rank: '1' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // If editing, delete the old result first to deduct old points properly
      if (editId) {
        await fetch(`/api/results/${editId}`, { method: 'DELETE' })
      }

      // Auto-create/fetch participant for individual
      let participantId = null
      if (selectedProg.type === 'INDIVIDUAL') {
        const pRes = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chestNumber: entryForm.chestNumber,
            name: entryForm.name,
            groupId: entryForm.groupId,
          })
        })
        const pData = await pRes.json()
        participantId = pData.id
      }

      // Determine points
      let points = 0
      if (entryForm.rank === '1') points = selectedProg.pointsFirst
      else if (entryForm.rank === '2') points = selectedProg.pointsSecond
      else if (entryForm.rank === '3') points = selectedProg.pointsThird

      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProg.id,
          participantId,
          groupId: entryForm.groupId,
          marks: 100,
          rank: entryForm.rank,
          pointsAwarded: points,
          published: true 
        })
      })

      // Reset and reload
      setEntryForm({ chestNumber: '', name: '', groupId: '', rank: '1' })
      setEditId(null)
      mutateResults()
    } catch (err) {
      console.error(err)
      alert("Failed to publish result. Check connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (res: any) => {
    setEditId(res.id)
    setEntryForm({
      rank: res.rank?.toString() || '1',
      groupId: res.groupId,
      chestNumber: res.participant?.chestNumber || '',
      name: res.participant?.name || ''
    })
  }

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Delete this published result? This will deduct points.')) return
    setIsSubmitting(true)
    await fetch(`/api/results/${id}`, { method: 'DELETE' })
    setEditId(null)
    setEntryForm({ chestNumber: '', name: '', groupId: '', rank: '1' })
    mutateResults()
    setIsSubmitting(false)
  }

  const filteredPrograms = programs?.filter((p: any) => p.categoryId === selectedCat)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mark Entry & Publishing</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Select Category</label>
          <select value={selectedCat} onChange={e => { setSelectedCat(e.target.value); setSelectedProg(null); }} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700">
            <option value="">-- Choose Category --</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Select Program</label>
          <select 
            disabled={!selectedCat}
            value={selectedProg?.id || ''} 
            onChange={e => {
              setSelectedProg(programs.find((p: any) => p.id === e.target.value))
              setEditId(null)
              setEntryForm({ chestNumber: '', name: '', groupId: '', rank: '1' })
            }} 
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 disabled:opacity-50"
          >
            <option value="">-- Choose Program --</option>
            {filteredPrograms?.map((prog: any) => (
              <option key={prog.id} value={prog.id}>{prog.name} ({prog.type})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedProg && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">{editId ? 'Edit Result' : 'Enter Results'}</h2>
            <form onSubmit={handlePublish} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Rank Position</label>
                  <select required value={entryForm.rank} onChange={e => setEntryForm({...entryForm, rank: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700">
                    <option value="1">1st Place ({selectedProg.pointsFirst} pts)</option>
                    <option value="2">2nd Place ({selectedProg.pointsSecond} pts)</option>
                    <option value="3">3rd Place ({selectedProg.pointsThird} pts)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Winning Group</label>
                  <select required value={entryForm.groupId} onChange={e => setEntryForm({...entryForm, groupId: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700">
                    <option value="">-- Select Group --</option>
                    {groups?.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedProg.type === 'INDIVIDUAL' && (
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-1">Chest No.</label>
                    <input required type="text" value={entryForm.chestNumber} onChange={e => setEntryForm({...entryForm, chestNumber: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Participant Name</label>
                    <input required type="text" value={entryForm.name} onChange={e => setEntryForm({...entryForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setEntryForm({ chestNumber: '', name: '', groupId: '', rank: '1' }); }} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-md font-bold text-lg">
                    Cancel Edit
                  </button>
                )}
                <button disabled={isSubmitting} type="submit" className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded-md font-bold text-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" /> 
                  {isSubmitting ? 'Publishing...' : editId ? 'Update Result' : 'Publish Result'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-y-auto max-h-[500px]">
            <h2 className="text-xl font-semibold mb-4">Published Results</h2>
            {results?.length === 0 ? (
              <p className="text-gray-500">No results published yet for this program.</p>
            ) : (
              <ul className="space-y-3">
                {results?.map((res: any) => (
                  <li key={res.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : '🥉'}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{res.group.name}</span>
                      </div>
                      {res.participant && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          #{res.participant.chestNumber} - {res.participant.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="font-bold text-green-600">+{res.pointsAwarded} pts</div>
                      <div className="flex space-x-3 mt-1">
                        <button onClick={() => handleEdit(res)} className="text-xs flex items-center text-blue-500 hover:text-blue-700 font-semibold">
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDeleteResult(res.id)} className="text-xs flex items-center text-red-500 hover:text-red-700 font-semibold">
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
