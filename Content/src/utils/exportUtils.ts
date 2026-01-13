/**
 * VinIA - Utils de Exportación
 * 
 * Funciones para exportar datos a PDF y Excel.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (title: string, columns: string[], data: any[][], filename: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

    // Table
    autoTable(doc, {
        head: [columns],
        body: data,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [184, 148, 90] } // Primary color approximate
    });

    doc.save(`${filename}.pdf`);
};

export const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};
