import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-900 animate-pulse flex flex-col h-full">
      <div className="w-full h-48 bg-slate-900 rounded-xl mb-4"></div>
      <div className="h-6 bg-slate-900 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-900 rounded-md w-1/2 mb-4"></div>
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-3 bg-slate-900 rounded w-full"></div>
        <div className="h-3 bg-slate-900 rounded w-full"></div>
        <div className="h-3 bg-slate-900 rounded w-5/6"></div>
      </div>
      <div className="flex gap-3 mt-auto">
        <div className="h-10 bg-slate-900 rounded-lg flex-1"></div>
        <div className="h-10 bg-slate-900 rounded-lg flex-1"></div>
      </div>
    </div>
  );
}

export function DetailedPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse w-full">
      <div className="w-full h-96 bg-slate-900 rounded-2xl mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 bg-slate-900 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-900 rounded-md w-full"></div>
          <div className="h-4 bg-slate-900 rounded-md w-5/6"></div>
          <div className="h-4 bg-slate-900 rounded-md w-4/5"></div>
          <div className="h-48 bg-slate-900 rounded-xl mt-8"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-900 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse w-full">
      <div className="h-10 bg-slate-900 rounded-md w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="h-32 bg-slate-900 rounded-xl"></div>
        <div className="h-32 bg-slate-900 rounded-xl"></div>
        <div className="h-32 bg-slate-900 rounded-xl"></div>
      </div>
      <div className="h-8 bg-slate-900 rounded-md w-1/6 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
