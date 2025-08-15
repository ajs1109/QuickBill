import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Invoice } from '../types';

const INVOICES_KEY = '@invoices';

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
      return invoicesJson ? JSON.parse(invoicesJson) : [];
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