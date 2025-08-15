import { router } from 'expo-router';
import { Plus, Save, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import type { Invoice, InvoiceItem } from '../../types';
import { invoiceStorage } from '../../utils/storage';

export default function CreateInvoiceScreen() {
  const uuidv4 = uuid.v4;   
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uuidv4().toString(), name: '', quantity: 1, price: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(10);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { id: uuidv4().toString(), name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculatePending = () => {
    return Math.max(0, calculateTotal() - paidAmount);
  };

  const getPaymentStatus = () => {
    const total = calculateTotal();
    if (paidAmount >= total) return 'paid';
    if (paidAmount > 0) return 'partial';
    return 'pending';
  };

  const handleSaveInvoice = async () => {
    if (!clientName.trim()) {
      Alert.alert('Error', 'Please enter client name');
      return;
    }

    if (items.length === 0 || items.every(item => !item.name.trim())) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const validItems = items.filter(item => item.name.trim());
    
    const invoice: Invoice = {
      id: uuidv4().toString(),
      invoiceNumber,
      clientName,
      clientPhone,
      clientAddress,
      date,
      dueDate,
      items: validItems,
      subtotal: calculateSubtotal(),
      taxRate,
      taxAmount: calculateTax(),
      total: calculateTotal(),
      paidAmount,
      status: getPaymentStatus(),
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      await invoiceStorage.saveInvoice(invoice);
      Alert.alert(
        'Success',
        'Invoice saved successfully!',
        [
          {
            text: 'View Invoices',
            onPress: () => router.push('/(tabs)'),
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setInvoiceNumber(`INV-${Date.now()}`);
              setClientName('');
              setClientPhone('');
              setClientAddress('');
              setDate(new Date().toISOString().split('T')[0]);
              setDueDate('');
              setItems([{ id: uuidv4().toString(), name: '', quantity: 1, price: 0 }]);
              setPaidAmount(0);
              setNotes('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Invoice</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Invoice Number</Text>
            <TextInput
              style={styles.input}
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
              placeholder="INV-001"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Client Name *</Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Enter client name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Client Phone</Text>
            <TextInput
              style={styles.input}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="+919234567890"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Client Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={clientAddress}
              onChangeText={setClientAddress}
              placeholder="Enter client address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(value) => updateItem(item.id, 'name', value)}
                placeholder="Item name"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    value={item.price.toString()}
                    onChangeText={(value) => updateItem(item.id, 'price', parseFloat(value) || 0)}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalText}>
                  Total: ₹{(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Calculations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Tax</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Tax Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={taxRate.toString()}
                onChangeText={(value) => setTaxRate(parseFloat(value) || 0)}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Paid Amount</Text>
              <TextInput
                style={styles.input}
                value={paidAmount.toString()}
                onChangeText={(value) => setPaidAmount(parseFloat(value) || 0)}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>

          <View style={styles.calculationCard}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Subtotal:</Text>
              <Text style={styles.calculationValue}>₹{calculateSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Tax ({taxRate}%):</Text>
              <Text style={styles.calculationValue}>₹{calculateTax().toFixed(2)}</Text>
            </View>
            <View style={[styles.calculationRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Paid:</Text>
              <Text style={styles.calculationValue}>₹{paidAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Pending:</Text>
              <Text style={[styles.calculationValue, { color: calculatePending() > 0 ? '#ef4444' : '#10b981' }]}>
                ₹{calculatePending().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveInvoice}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save Invoice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  removeButton: {
    padding: 4,
  },
  itemTotal: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  calculationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 16
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});