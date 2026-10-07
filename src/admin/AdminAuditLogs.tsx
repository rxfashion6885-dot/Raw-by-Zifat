import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import type { AuditLog } from '../types/index.js';
import { History, Shield, Clock } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await api.adminGetAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error('Failed to load audit logs', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <AdminLayout activeTab="audit-logs">
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            SECURITY & COMPLIANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
            Administrator Audit Trail
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tamper-evident record of all critical administrative changes, order decisions, and price alterations.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-neutral-400">
              Loading Audit Trail...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-400">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    <th className="py-3.5 px-4">Action Type</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4">Admin Email</th>
                    <th className="py-3.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[11px] text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                          {l.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-neutral-800">
                        {l.details}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                        {l.adminEmail}
                      </td>

                      <td className="py-3.5 px-4 text-right text-[11px] text-neutral-400">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
