export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  notes?: string;
  createdAt: string;
}