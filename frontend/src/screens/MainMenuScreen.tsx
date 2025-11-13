import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MenuItem {
  id: string;
  label: string;
}

interface MainMenuScreenProps {
  menuItems: MenuItem[];
  selectedIndex: number;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ menuItems, selectedIndex }) => {
  return (
    <View>
      <Text style={styles.title}>PAGER 2077</Text>
      <Text> </Text>
      {menuItems.map((item, index) => (
        <Text 
          key={item.id} 
          style={[
            styles.item,
            index === selectedIndex ? styles.itemSelected : styles.itemUnselected
          ]}
        >
          {index === selectedIndex ? '>' : ' '} {item.label}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
    fontFamily: 'MyPager',
  },
  item: {
    fontSize: 14,
    paddingHorizontal: 4,
    fontFamily: 'MyPager',
  },
  itemSelected: {
    color: '#9CB4A8',
    backgroundColor: '#1A1A1A',
  },
  itemUnselected: {
    color: '#1A1A1A',
    backgroundColor: 'transparent',
  },
});
