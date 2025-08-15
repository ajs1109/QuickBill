import { Tabs } from 'expo-router';
import { FileText, Plus, Settings } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ size, color }) => (
            <View style={{ padding: 2 }}>
              <FileText size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => (
            <View 
              style={{ 
                backgroundColor: color === '#3b82f6' ? '#3b82f6' : 'transparent',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Plus 
                size={size} 
                color={color === '#3b82f6' ? '#ffffff' : color} 
                strokeWidth={2} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <View style={{ padding: 2 }}>
              <Settings size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}