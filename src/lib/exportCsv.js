export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header] ?? "";
          val = String(val).replace(/"/g, '""');
          if (/[",\n\r]/.test(val)) {
            val = `"${val}"`;
          }
          return val;
        })
        .join(",")
    )
  ];

  const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

