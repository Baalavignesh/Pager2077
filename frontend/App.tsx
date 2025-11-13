import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NativeBaseProvider, Box, Text, Pressable, VStack } from 'native-base';
import { retroTheme } from './src/theme';
import * as Font from 'expo-font';

type Screen = 'main' | 'messages' | 'friends' | 'myhex' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Main menu items
  const mainMenu = [
    { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
    { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
    { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
    { id: 'settings', label: '4. SETTINGS', screen: 'settings' as Screen },
  ];

  // Mock data
  const friends = [
    { hexCode: 'F1E2D3C4', status: 'ONLINE' },
    { hexCode: 'B5A6C7D8', status: 'OFFLINE' },
    { hexCode: '9C8D7E6F', status: 'ONLINE' },
  ];

  const messages = [
    { from: 'F1E2D3C4', text: 'HELLO THERE!', time: '14:30' },
    { from: 'B5A6C7D8', text: 'HOW ARE YOU?', time: '12:15' },
  ];

  React.useEffect(() => {
    async function loadFont() {
      try {
        await Font.loadAsync({
          'MyPager': require('./assets/MyPager.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontLoaded(true);
      }
    }
    loadFont();
  }, []);

  if (!fontLoaded) {
    return (
      <NativeBaseProvider theme={retroTheme}>
        <Box flex={1} bg="#2A2A2A" />
      </NativeBaseProvider>
    );
  }

  const navigate = (direction: 'up' | 'down') => {
    const maxIndex = currentScreen === 'main' ? mainMenu.length - 1 :
      currentScreen === 'friends' ? friends.length - 1 :
        currentScreen === 'messages' ? messages.length - 1 : 0;

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSelect = () => {
    if (currentScreen === 'main') {
      const selected = mainMenu[selectedIndex];
      setCurrentScreen(selected.screen);
      setSelectedIndex(0);
    }
  };

  const handleBack = () => {
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
      setSelectedIndex(0);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2} color="foreground">
              PAGER 2077
            </Text>
            <Text color="foreground"> </Text>
            {mainMenu.map((item, index) => (
              <Text key={item.id} fontSize="md"
                color={index === selectedIndex ? 'background' : 'foreground'}
                bg={index === selectedIndex ? 'foreground' : 'transparent'}
                px={1}>
                {index === selectedIndex ? '>' : ' '} {item.label}
              </Text>
            ))}
          </VStack>
        );

      case 'messages':
        return (
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2} color="foreground">
              MESSAGES
            </Text>
            <Text color="foreground"> </Text>
            {messages.length === 0 ? (
              <Text fontSize="md" color="foreground">NO MESSAGES</Text>
            ) : (
              messages.map((msg, index) => (
                <Text key={index} fontSize="md"
                  color={index === selectedIndex ? 'background' : 'foreground'}
                  bg={index === selectedIndex ? 'foreground' : 'transparent'}
                  px={1}>
                  {index === selectedIndex ? '>' : ' '} {msg.from}
                </Text>
              ))
            )}
          </VStack>
        );

      case 'friends':
        return (
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2} color="foreground">
              FRIENDS
            </Text>
            <Text color="foreground"> </Text>
            {friends.map((friend, index) => (
              <Text key={friend.hexCode} fontSize="md"
                color={index === selectedIndex ? 'background' : 'foreground'}
                bg={index === selectedIndex ? 'foreground' : 'transparent'}
                px={1}>
                {index === selectedIndex ? '>' : ' '} {friend.hexCode}
              </Text>
            ))}
          </VStack>
        );

      case 'myhex':
        return (
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2} color="foreground">
              MY HEX CODE
            </Text>
            <Text color="foreground"> </Text>
            <Text fontSize="md" color="foreground" textAlign="center">A1B2C3D4</Text>
            <Text color="foreground"> </Text>
            <Text fontSize="md" color="foreground" textAlign="center">SHARE THIS CODE</Text>
            <Text fontSize="md" color="foreground" textAlign="center">WITH FRIENDS</Text>
          </VStack>
        );

      case 'settings':
        return (
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2} color="foreground">
              SETTINGS
            </Text>
            <Text color="foreground"> </Text>
            <Text fontSize="md" color="foreground">1. SOUND: ON</Text>
            <Text fontSize="md" color="foreground">2. VIBRATE: ON</Text>
            <Text fontSize="md" color="foreground">3. ABOUT</Text>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <NativeBaseProvider theme={retroTheme}>
      <Box flex={1} bg="#2A2A2A" p={4} justifyContent="space-between"
        borderWidth={4} borderTopColor="#4A4A4A" borderLeftColor="#4A4A4A"
        borderRightColor="#1A1A1A" borderBottomColor="#1A1A1A"
        shadow={9}>
        <StatusBar hidden />

        {/* LCD Display */}
        <Box bg="#9CB4A8" borderWidth={4} borderTopColor="#1A1A1A" borderLeftColor="#1A1A1A"
          borderRightColor="#BCCAB8" borderBottomColor="#BCCAB8" p={5} height="45%" mt={2}
          shadow={3}>
          {renderScreen()}
        </Box>

        {/* Status LEDs */}
        <Box flexDirection="row" justifyContent="flex-start" my={3} pl={5}>
          <Box w={3} h={3} borderRadius="full" bg="#FFD700" mr={4} shadow={2} />
          <Box w={3} h={3} borderRadius="full" bg="#FF4444" shadow={2} />
        </Box>

        {/* Action Buttons */}
        <Box flexDirection="row" justifyContent="space-around" my={4}>
          <Pressable onPress={handleSelect}
            bg="#4A4A4A" borderWidth={3} borderTopColor="#6A6A6A" borderLeftColor="#6A6A6A"
            borderRightColor="#2A2A2A" borderBottomColor="#2A2A2A" w={28} h={12}
            justifyContent="center" alignItems="center" shadow={6}>
            <Text fontSize="sm" fontWeight="bold" color="#E0E0E0">SELECT</Text>
          </Pressable>
          <Pressable onPress={handleBack}
            bg="#4A4A4A" borderWidth={3} borderTopColor="#6A6A6A" borderLeftColor="#6A6A6A"
            borderRightColor="#2A2A2A" borderBottomColor="#2A2A2A" w={28} h={12}
            justifyContent="center" alignItems="center" shadow={6}>
            <Text fontSize="sm" fontWeight="bold" color="#E0E0E0">BACK</Text>
          </Pressable>
        </Box>

        {/* Navigation Controls */}
        <Box flexDirection="row" justifyContent="center" alignItems="center" my={4}>
          <Pressable onPress={() => navigate('up')} mx={3}
            bg="#4A4A4A" borderWidth={3} borderTopColor="#6A6A6A" borderLeftColor="#6A6A6A"
            borderRightColor="#2A2A2A" borderBottomColor="#2A2A2A" w={15} h={12}
            justifyContent="center" alignItems="center" shadow={6}>
            <Text fontSize="lg" fontWeight="bold" color="#E0E0E0">▲</Text>
          </Pressable>
          <Pressable onPress={() => navigate('down')} mx={3}
            bg="#4A4A4A" borderWidth={3} borderTopColor="#6A6A6A" borderLeftColor="#6A6A6A"
            borderRightColor="#2A2A2A" borderBottomColor="#2A2A2A" w={15} h={12}
            justifyContent="center" alignItems="center" shadow={6}>
            <Text fontSize="lg" fontWeight="bold" color="#E0E0E0">▼</Text>
          </Pressable>
        </Box>
aa
        Yoo

      </Box>
    </NativeBaseProvider>
  );
}