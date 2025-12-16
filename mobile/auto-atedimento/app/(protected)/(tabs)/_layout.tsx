import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A11613', 
        tabBarInactiveTintColor: '#CCCCCC', 
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#e0e0e0', 
        },
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }) => <FontAwesome6 name="cart-shopping" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}