import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Invoice } from '../types';
import type { CompanyInfo } from '../types/settings';

const INVOICES_KEY = '@invoices';
const COMPANY_INFO_KEY = '@company_info';

export const invoiceStorage = {
  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      const existingInvoices = await this.getAllInvoices();
      const updatedInvoices = [...existingInvoices, invoice];
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
    } catch (error) {
      throw new Error('Failed to save invoice');
    }
  },

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const invoicesJson = await AsyncStorage.getItem(INVOICES_KEY);
      let invoices: Invoice[] = invoicesJson ? JSON.parse(invoicesJson) : [];
      invoices = invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return invoices;
    } catch (error) {
      return [];
    }
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const invoices = await this.getAllInvoices();
      return invoices.find(invoice => invoice.id === id) || null;
    } catch (error) {
      return null;
    }
  },

  async updateInvoice(updatedInvoice: Invoice): Promise<void> {
    try {
      const invoices = await this.getAllInvoices();
      const updatedInvoices = invoices.map(invoice =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      );
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
    } catch (error) {
      throw new Error('Failed to update invoice');
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    try {
      const invoices = await this.getAllInvoices();
      const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(filteredInvoices));
    } catch (error) {
      throw new Error('Failed to delete invoice');
    }
  },

  async clearAllInvoices(): Promise<void> {
    try {
      await AsyncStorage.removeItem(INVOICES_KEY);
    } catch (error) {
      throw new Error('Failed to clear invoices');
    }
  },
};

export const companyStorage = {
  async getInfo(): Promise<CompanyInfo | null> {
    try {
      const data = await AsyncStorage.getItem(COMPANY_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  async setInfo(info: CompanyInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      throw new Error('Failed to save company info');
    }
  },

  async clearInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem(COMPANY_INFO_KEY);
    } catch (error) {
      throw new Error('Failed to clear company info');
    }
  },
};
