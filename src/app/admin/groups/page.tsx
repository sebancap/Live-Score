'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function GroupsPage() {
  const { data: groups, mutate } = useSWR('/api/groups', fetcher)
  const [formData, setFormData] = useState({ id: '', name: '', colorCode: '#000000', logoUrl: '' })
  const [isEditing, setIsEditing] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = isEditing ? `/api/groups/${formData.id}` : '/api/groups'
    const method = isEditing ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    
    setFormData({ id: '', name: '', colorCode: '#000000', logoUrl: '' })
    setIsEditing(false)
    mutate()
  }

  const handleEdit = (group: any) => {
    setFormData(group)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Groups / Houses</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Group' : 'Add New Group'}</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input type="color" value={formData.colorCode} onChange={e => setFormData({...formData, colorCode: e.target.value})} className="h-10 w-20 px-1 py-1 border rounded-md cursor-pointer" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Logo Upload (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 flex items-center text-sm font-medium transition-colors">
                <ImageIcon className="w-4 h-4 mr-2" /> Choose Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {formData.logoUrl && <img src={formData.logoUrl} alt="Preview" className="h-10 w-10 object-contain rounded-md" />}
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium h-10 flex items-center">
            {isEditing ? 'Update' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
          </button>
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', colorCode: '#000000', logoUrl: '' }) }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium h-10">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 font-medium text-sm">Logo</th>
              <th className="px-6 py-3 font-medium text-sm">Name</th>
              <th className="px-6 py-3 font-medium text-sm">Color</th>
              <th className="px-6 py-3 font-medium text-sm">Total Points</th>
              <th className="px-6 py-3 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups?.map((group: any) => (
              <tr key={group.id}>
                <td className="px-6 py-4">
                  {group.logoUrl ? <img src={group.logoUrl} alt={group.name} className="w-10 h-10 object-contain rounded-md" /> : <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md" />}
                </td>
                <td className="px-6 py-4 font-medium">{group.name}</td>
                <td className="px-6 py-4">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: group.colorCode }} title={group.colorCode} />
                </td>
                <td className="px-6 py-4 text-lg font-bold">{group.totalPoints}</td>
                <td className="px-6 py-4 flex justify-end space-x-3">
                  <button onClick={() => handleEdit(group)} className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(group.id)} className="text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/30 p-2 rounded-md">
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
