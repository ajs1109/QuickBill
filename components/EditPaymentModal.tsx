import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { CustomTextInput } from './custom/customTextInput';
import type { Invoice } from '../types';

interface EditPaymentModalProps {
  visible: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (invoiceId: string, newPaidAmount: string) => void;
}

export default function EditPaymentModal({
  visible,
  invoice,
  onClose,
  onSave,
}: EditPaymentModalProps) {
  const [paidAmountStr, setPaidAmountStr] = useState('');

  useEffect(() => {
    if (invoice) {
      setPaidAmountStr(invoice.paidAmount);
    }
  }, [invoice]);

  if (!invoice) return null;

  const paidAmount = Number(paidAmountStr) || 0;
  const pendingAmount = Math.max(0, invoice.total - paidAmount);
  const newStatus = paidAmount >= invoice.total ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

  const handleSave = () => {
    if (isNaN(Number(paidAmountStr)) && paidAmountStr.trim() !== '') {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    onSave(invoice.id, paidAmountStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceLabel}>Invoice: {invoice.invoiceNumber}</Text>
            <Text style={styles.clientLabel}>Client: {invoice.clientName}</Text>
            <Text style={styles.totalLabel}>Total Amount: ₹{invoice.total.toFixed(2)}</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Paid Amount</Text>
            <CustomTextInput
              style={styles.input}
              value={paidAmountStr}
              onChangeText={setPaidAmountStr}
              keyboardType="numeric"
              placeholder="0.00"
              autoFocus
            />
          </View>

          <View style={styles.calculationCard}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Amount:</Text>
              <Text style={styles.calculationValue}>₹{invoice.total.toFixed(2)}</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Paid Amount:</Text>
              <Text style={styles.calculationValue}>
                {isNaN(Number(paidAmountStr)) ? paidAmountStr : `₹${paidAmount.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Pending Amount:</Text>
              <Text style={[styles.calculationValue, { color: pendingAmount > 0 ? '#ef4444' : '#10b981' }]}>
                ₹{pendingAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Status:</Text>
              <Text style={[styles.statusText, { color: getStatusColor(newStatus) }]}>
                {newStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={16} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return '#10b981';
    case 'partial':
      return '#f59e0b';
    case 'pending':
      return '#6b7280';
    case 'overdue':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  invoiceInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  clientLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  calculationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});
