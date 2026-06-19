import { 
  Activity, 
  CheckCircle2, 
  Server, 
  Database, 
  Clock, 
  Globe 
} from "lucide-react";

async function getHealth() {
    try {
        // เปลี่ยนจากใช้ header.host มาใช้ URL ของ Backend โดยตรง
        // หากต้องการความปลอดภัย แนะนำให้เก็บไว้ในไฟล์ .env เป็น NEXT_PUBLIC_BACKEND_URL
        const BACKEND_URL = 'http://localhost:3000'; 
        
        const resp = await fetch(`${BACKEND_URL}/api/health`, { 
            cache: 'no-store',
            next: { revalidate: 0 } 
        });
        
        if (!resp.ok) throw new Error('Health check failed');
        return await resp.json();
    } catch (err) {
        return { 
            status: "error", 
            message: err.message, 
            database: "disconnected", 
            timestamp: new Date().toISOString() 
        };
    }
}

export default async function HealthPage() {
    const data = await getHealth();
    const isOK = data.status === "ok";

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Activity className={`h-8 w-8 ${isOK ? 'text-emerald-500' : 'text-rose-500'}`} />
                        OR System Health
                    </h1>
                    <p className="text-slate-500 mt-1">สถานะฐานข้อมูลระบบจัดการห้องผ่าตัด</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                    isOK ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {isOK ? <CheckCircle2 className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                    {isOK ? "SYSTEM OPERATIONAL" : "SYSTEM DEGRADED"}
                </div>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isOK ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 font-medium">Database Connection</p>
                            <p className="text-lg font-bold text-slate-700">
                                {data.database === "ok" ? "Connected" : "Disconnected"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 font-medium">Last Checked</p>
                            <p className="text-lg font-bold text-slate-700">
                                {new Date(data.timestamp || Date.now()).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Details */}
            <section className="bg-slate-900 rounded-[2rem] p-8 text-white overflow-hidden relative">
                <div className="flex items-center gap-2 mb-4 opacity-60">
                    <Globe className="h-4 w-4" />
                    <h2 className="text-xs font-bold uppercase tracking-widest">System Diagnostics</h2>
                </div>
                <pre className="font-mono text-sm text-blue-300 overflow-x-auto custom-scrollbar">
                    {JSON.stringify(data, null, 4)}
                </pre>
            </section>
        </main>
    );
}