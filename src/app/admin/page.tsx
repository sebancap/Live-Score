'use client'

import useSWR from 'swr'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR('/api/scoreboard', fetcher, { refreshInterval: 5000 })

  if (isLoading) {
    return (
      <div>Loading dashboard...</div>
    )
  }

  if (error) {
    return (
      <div>Failed to load data</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <a 
          href="/api/export" 
          download="livescore_results.csv"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export to Excel (CSV)
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Groups</h3>
          <p className="mt-2 text-3xl font-bold">{data?.groups?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Results Published</h3>
          <p className="mt-2 text-3xl font-bold">{data?.latestResults?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-6">
          <h3 className="text-lg font-medium mb-6">Points Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.groups || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="totalPoints" radius={[4, 4, 0, 0]}>
                  {data?.groups?.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.colorCode || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Current Group Standings</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {data?.groups?.map((group: any, idx: number) => (
              <li key={group.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: group.colorCode }}
                  />
                  <span className="font-medium text-lg">{group.name}</span>
                </div>
                <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{group.totalPoints} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

