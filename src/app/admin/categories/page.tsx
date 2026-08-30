'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CategoriesPage() {
  const { data: categories, mutate } = useSWR('/api/categories', fetcher)
  const [formData, setFormData] = useState({ id: '', name: '' })
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = isEditing ? `/api/categories/${formData.id}` : '/api/categories'
    const method = isEditing ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    
    setFormData({ id: '', name: '' })
    setIsEditing(false)
    mutate()
  }

  const handleEdit = (category: any) => {
    setFormData(category)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium mb-1">Name (e.g. Sub-Junior, Senior)</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium h-10 flex items-center">
            {isEditing ? 'Update' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
          </button>
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '' }) }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium h-10">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 font-medium text-sm">Name</th>
              <th className="px-6 py-3 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories?.map((cat: any) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 flex justify-end space-x-3">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
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
