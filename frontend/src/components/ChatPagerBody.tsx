import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatNumPad } from './ChatNumPad';

interface ChatPagerBodyProps {
    onNumberPress: (number: string) => void;
    onConfirm: () => void;
    onBack: () => void;
    onCall: () => void;
    onMenu: () => void;
    soundEnabled?: boolean;
    vibrateEnabled?: boolean;
}

export const ChatPagerBody: React.FC<ChatPagerBodyProps> = ({
    onNumberPress,
    onConfirm,
    onBack,
    onCall,
    onMenu,
    soundEnabled = true,
    vibrateEnabled = true
}) => {
    return (
        <View style={styles.wrapper}>
            <View style={styles.innerRecess}>
                <LinearGradient
                    colors={['#c1c1c1ff', '#c1c1c1ff', '#c1c1c1ff']}
                    style={styles.recessGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View style={styles.contentArea}>
                        <ChatNumPad
                            onNumberPress={onNumberPress}
                            onConfirm={onConfirm}
                            onBack={onBack}
                            onCall={onCall}
                            onMenu={onMenu}
                            soundEnabled={soundEnabled}
                            vibrateEnabled={vibrateEnabled}
                        />
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        borderRadius: 20,
        borderBottomEndRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        margin: 12,
        marginTop: 4,
    },
    innerRecess: {
        flex: 1,
        borderRadius: 14,
         borderBottomLeftRadius: "15%",
        borderBottomRightRadius: "15%",
        overflow: 'hidden',
    },
    recessGradient: {
        flex: 1,
    },
    contentArea: {
        flex: 1,
    },
});
