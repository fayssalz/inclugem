export function exportToJSON(inclusions, filename = 'gem_inclusions_export.json') {
  const jsonStr = JSON.stringify(inclusions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(inclusions, filename = 'gem_inclusions_export.csv') {
  if (!inclusions || !inclusions.length) return;
  
  const headers = [
    'id', 'imageNumber', 'title', 'gemType', 'taxonomy', 'origin',
    'enhancement', 'lighting', 'photographer', 'fieldOfView',
    'magnification', 'datePosted', 'description', 'imageUrl'
  ];
  
  const rows = inclusions.map(inc => {
    return headers.map(h => {
      let val = inc[h] || '';
      // Escape quotes and line breaks for CSV format
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid JSON format: expected an array of inclusion objects.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
