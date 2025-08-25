import EditPaymentModal from '@/components/EditPaymentModal';
import { useFocusEffect } from 'expo-router';
import { Edit3, FileText, Search, Share, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Invoice } from '../../types';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { companyStorage, invoiceStorage } from '../../utils/storage';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );
  const loadInvoices = async () => {
    try {
      const loadedInvoices = await invoiceStorage.getAllInvoices();
      setInvoices(loadedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const handleDeleteInvoice = async (id: string) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await invoiceStorage.deleteInvoice(id);
            await loadInvoices();
          },
        },
      ]
    );
  };

  const handleGeneratePDF = async (invoice: Invoice) => {
    try {
      const companyInfo = await companyStorage.getInfo();
      if (!companyInfo) {
        Alert.alert('Error', 'Company information not found');
        return;
      }
      await generateInvoicePDF(invoice, companyInfo);
    } catch (error) {
      Alert.alert('Error in logo', error instanceof Error ? error.message : String(error));
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'overdue':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleEditPayment = (invoice: Invoice) => {
  setSelectedInvoice(invoice);
  setEditModalVisible(true);
};

const handleSavePayment = async (invoiceId: string, newPaidAmount: string) => {
  try {
    const paidAmount = Number(newPaidAmount) || 0;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const newStatus = paidAmount >= invoice.total ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

    const updatedInvoice: Invoice = {
      ...invoice,
      paidAmount: newPaidAmount,
      status: newStatus,
    };
    
    await invoiceStorage.updateInvoice(updatedInvoice);
    await loadInvoices();
  } catch (error) {
    Alert.alert('Error', 'Failed to update payment');
  }
};

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>#{item.invoiceNumber}</Text>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.invoiceAmount}>
          <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      {item.status !== 'paid' && (
        <View style={styles.pendingInfo}>
          <Text style={styles.pendingText}>
            Pending: ₹{(item.total - (parseFloat(item.paidAmount) || 0)).toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.invoiceActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleGeneratePDF(item)}
        >
          <Share size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Share PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPayment(item)}
        >
          <Edit3 size={16} color="#10b981" />
          <Text style={[styles.actionText, { color: '#10b981' }]}>Edit Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteInvoice(item.id)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Manage your invoices</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
        </View>
      </View>

      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>
              Create your first invoice to get started
            </Text>
          </View>
        }
      />
      <EditPaymentModal
        visible={editModalVisible}
        invoice={selectedInvoice}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        onSave={handleSavePayment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  invoiceAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingInfo: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pendingText: {
    color: '#d97706',
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});