'use client';
import React from 'react';

export const JournalDetailModal = ({ journal, onClose }: { journal: any; onClose: () => void }) => {
  if (!journal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-1">{journal.title}</h3>
        <p className="text-sm text-gray-500 mb-4">Publisher: {journal.publisher}</p>

        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="text-xs text-gray-400 uppercase font-bold block">ISSN (Print)</span>
            <span className="text-sm font-semibold text-gray-700">{journal.issn}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-bold block">ISSN (Online)</span>
            <span className="text-sm font-semibold text-gray-700">{journal.issnOnline}</span>
          </div>
        </div>

        {/* ตารางแสดง Area และ Rank ของ Journal นี้ */}
        <h4 className="text-md font-semibold text-gray-800 mb-2">Subject Areas & Ranks</h4>
        <div className="border border-gray-100 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="py-2 px-3">Subject Area</th>
                <th className="py-2 px-3">Assigned Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {journal.allAreas?.map((a: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 px-3 text-gray-800">{a.areaName}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 text-xs rounded-md font-semibold">
                      {journal.topRank !== '—' ? journal.topRank : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};