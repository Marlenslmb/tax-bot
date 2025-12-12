import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export function App() {
  const [email, setEmail] = useState('admin@bizassist.kg');
  const [password, setPassword] = useState('admin123');
  const [token, setToken] = useState<string | null>(null);
  const [health, setHealth] = useState<string>('unknown');

  useEffect(() => {
    api.get('/health').then(r => setHealth(r.data.status)).catch(() => setHealth('down'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-2xl mx-auto py-16">
        <h1 className="text-3xl font-semibold mb-6">BizAssist Admin</h1>
        <div className="mb-4">Health: <span className={health==='ok' ? 'text-green-600' : 'text-red-600'}>{health}</span></div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="text-lg font-medium">Вход</div>
          <input className="border rounded px-3 py-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
          <input className="border rounded px-3 py-2 w-full" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={async()=>{
              const r = await api.post('/auth/login', { email, password });
              setToken(r.data.accessToken);
            }}>Login</button>
            <button className="px-4 py-2 rounded bg-gray-200" onClick={()=>setToken(null)}>Logout</button>
          </div>
          <div className="text-sm text-gray-600">Token: {token ? token.slice(0, 18) + '...' : '—'}</div>

          <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={async()=>{
            if(!token) return alert('Login first');
            const r = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` }});
            alert(JSON.stringify(r.data));
          }}>Проверить защищенный маршрут</button>
        </div>
      </div>
    </div>
  );
}
