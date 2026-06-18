"use client";

import React, { useState, useRef } from 'react';
import { Button, toast } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';

export const TranslationActions: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/translations/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          
          const res = await fetch('/api/translations/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Import failed');
          }
          
          toast.success('Imported successfully');
          router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err.message || 'Invalid JSON file');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } catch (_err) {
      toast.error('Failed to read file');
      setIsImporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0 var(--gutter-h)' }}>
      <Button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export JSON'}
      </Button>
      <Button 
        buttonStyle="secondary" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isImporting}
      >
        {isImporting ? 'Importing...' : 'Import JSON'}
      </Button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};
