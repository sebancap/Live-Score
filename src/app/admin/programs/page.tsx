'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Edit2, Trash2, Radio } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProgramsPage() {
  const { data: programs, mutate } = useSWR('/api/programs', fetcher)
  const { data: categories } = useSWR('/api/categories', fetcher)
  
  const [formData, setFormData] = useState({ 
    id: '', name: '', categoryId: '', type: 'INDIVIDUAL', 
    pointsFirst: 5, pointsSecond: 3, pointsThird: 1,
    stageName: '', time: '', isLive: false
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleTypeChange = (type: string) => {
    if (type === 'GROUP') {
      setFormData({ ...formData, type, pointsFirst: 10, pointsSecond: 5, pointsThird: 3 })
    } else {
      setFormData({ ...formData, type, pointsFirst: 5, pointsSecond: 3, pointsThird: 1 })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = isEditing ? `/api/programs/${formData.id}` : '/api/programs'
    const method = isEditing ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        pointsFirst: Number(formData.pointsFirst),
        pointsSecond: Number(formData.pointsSecond),
        pointsThird: Number(formData.pointsThird),
      }),
    })
    
    setFormData({ id: '', name: '', categoryId: '', type: 'INDIVIDUAL', pointsFirst: 5, pointsSecond: 3, pointsThird: 1, stageName: '', time: '', isLive: false })
    setIsEditing(false)
    mutate()
  }

  const handleEdit = (program: any) => {
    setFormData({
      ...program,
      stageName: program.stageName || '',
      time: program.time || '',
      isLive: program.isLive || false
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await fetch(`/api/programs/${id}`, { method: 'DELETE' })
    mutate()
  }

  const toggleLive = async (program: any) => {
    await fetch(`/api/programs/${program.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...program, isLive: !program.isLive }),
    })
    mutate()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Programs / Events</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Program' : 'Add New Program'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
              <option value="">Select...</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select required value={formData.type} onChange={e => handleTypeChange(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
              <option value="INDIVIDUAL">Individual</option>
              <option value="GROUP">Group</option>
            </select>
          </div>
          
          {/* New Fields */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Stage Name</label>
            <input type="text" placeholder="e.g. Main Stage" value={formData.stageName} onChange={e => setFormData({...formData, stageName: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Time</label>
            <input type="text" placeholder="e.g. 10:30 AM" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">1st Place Pts</label>
            <input required type="number" min="0" value={formData.pointsFirst} onChange={e => setFormData({...formData, pointsFirst: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">2nd Place Pts</label>
            <input required type="number" min="0" value={formData.pointsSecond} onChange={e => setFormData({...formData, pointsSecond: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">3rd Place Pts</label>
            <input required type="number" min="0" value={formData.pointsThird} onChange={e => setFormData({...formData, pointsThird: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium h-10 flex-1 flex items-center justify-center">
              {isEditing ? 'Update' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', categoryId: '', type: 'INDIVIDUAL', pointsFirst: 5, pointsSecond: 3, pointsThird: 1, stageName: '', time: '', isLive: false }) }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium h-10">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 font-medium text-sm">Name</th>
              <th className="px-6 py-3 font-medium text-sm">Category / Stage / Time</th>
              <th className="px-6 py-3 font-medium text-sm">Type & Points</th>
              <th className="px-6 py-3 font-medium text-sm">Status</th>
              <th className="px-6 py-3 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {programs?.map((prog: any) => (
              <tr key={prog.id} className={prog.isLive ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                <td className="px-6 py-4 font-bold">{prog.name}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{prog.category?.name}</div>
                  <div className="text-xs text-gray-500">{prog.stageName || 'No Stage'} • {prog.time || 'No Time'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700">{prog.type}</span>
                  <div className="text-xs text-gray-500 mt-1">{prog.pointsFirst}/{prog.pointsSecond}/{prog.pointsThird} pts</div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleLive(prog)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${prog.isLive ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    <Radio className={`w-3 h-3 ${prog.isLive ? 'animate-pulse' : ''}`} />
                    <span>{prog.isLive ? 'LIVE' : 'SET LIVE'}</span>
                  </button>
                </td>
                <td className="px-6 py-4 flex justify-end space-x-3">
                  <button onClick={() => handleEdit(prog)} className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(prog.id)} className="text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/30 p-2 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
