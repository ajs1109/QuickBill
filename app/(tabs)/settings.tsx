import { CustomTextInput } from '@/components/custom/customTextInput';
import { CompanyInfo } from '@/types/settings';
import { FileText, Info, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { companyStorage, invoiceStorage } from '../../utils/storage';

export default function SettingsScreen() {
const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    companyStorage.getInfo().then(info => {
      if (info) setCompanyInfo(info);
    });
  }, []);

  const handleSave = async () => {
    await companyStorage.setInfo(companyInfo);
    Alert.alert('Saved', 'Company info updated!');
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all invoices. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await invoiceStorage.clearAllInvoices();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const showAppInfo = () => {
    Alert.alert(
      'InvoiceApp',
      'Version 1.0.0\n\nA simple and elegant invoicing solution for small businesses and freelancers.\n\nCreated with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      <View style={styles.content}>
        {/* Company Information */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Company Information</Text>
        <Text style={styles.label}>Company Name</Text>
        <CustomTextInput
          placeholder="Company Name"
          style={styles.input}
          value={companyInfo.name}
          onChangeText={name => setCompanyInfo({ ...companyInfo, name })}
        />
        <Text style={styles.label}>Phone</Text>
        <CustomTextInput
          placeholder="Phone"
          style={styles.input}
          value={companyInfo.phone}
          onChangeText={phone => setCompanyInfo({ ...companyInfo, phone })}
        />
        <Text style={styles.label}>Email</Text>
        <CustomTextInput
          placeholder="Email"
          style={styles.input}
          value={companyInfo.email}
          onChangeText={email => setCompanyInfo({ ...companyInfo, email })}
        />
        <Text style={styles.label}>Address</Text>
        <CustomTextInput
          placeholder="Address"
          style={styles.input}
          value={companyInfo.address}
          onChangeText={address => setCompanyInfo({ ...companyInfo, address })}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Company Info</Text>
        </TouchableOpacity>
      </View>
        {/* Invoice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Settings</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <FileText size={20} color="#3b82f6" />
            <Text style={styles.settingButtonText}>Default Tax Rate</Text>
            <Text style={styles.settingButtonValue}>10%</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllData}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingButton} onPress={showAppInfo}>
            <Info size={20} color="#3b82f6" />
            <Text style={styles.settingButtonText}>About App</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  label: {
  fontSize: 14,
  fontWeight: '500',
  color: '#374151',
  marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  settingButtonValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 12,
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
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981', // Emerald green
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