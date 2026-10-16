import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      jsPDF,
      jsPdfAutoTable: autoTable,
    },
  };
});
