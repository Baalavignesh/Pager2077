import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ButtonGrid } from './ButtonGrid';

interface PagerBodyProps {
    onSelect: () => void;
    onBack: () => void;
    onNavigateUp: () => void;
    onNavigateDown: () => void;
}

export const PagerBody: React.FC<PagerBodyProps> = ({
    onSelect,
    onBack,
    onNavigateUp,
    onNavigateDown
}) => {
    return (
        <View style={styles.wrapper}>
            {/* Outer metallic frame - matching button style */}
            <LinearGradient
                colors={['#000', '#A0A0A0']}
                style={styles.outerGradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                {/* Inner highlight layer - matching button style */}
                <LinearGradient
                    colors={['#FAFAFA', '#3E3E3E', '#E5E5E5']}
                    style={styles.innerGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
                
                {/* Main body surface - matching button style */}
                <LinearGradient
                    colors={['#B9B9B9', '#969696']}
                    style={styles.bodyGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                >
                    {/* Inner black recessed area */}
                    <View style={styles.innerRecess}>
                        <LinearGradient
                            colors={['#1a1a1a', '#0a0a0a', '#000000']}
                            style={styles.recessGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            <View style={styles.contentArea}>
                                <ButtonGrid
                                    onSelect={onSelect}
                                    onBack={onBack}
                                    onNavigateUp={onNavigateUp}
                                    onNavigateDown={onNavigateDown}
                                />
                                
                                {/* Logo imprinted into plastic */}
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logo}>PAGER 2077</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: '40%',
        position: 'relative',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    outerGradient: {
        flex: 1,
        borderRadius: 20,
        padding: 1.25,
    },
    innerGradient: {
        position: 'absolute',
        top: 1,
        left: 1,
        right: 1,
        bottom: 1,
        borderRadius: 20,
    },
    bodyGradient: {
        flex: 1,
        margin: 2.5,
        borderRadius: 18,
        padding: 16,
        paddingBottom: 32,
        overflow: 'hidden',
    },
    innerRecess: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        // Inner shadow effect for depth
        borderWidth: 2,
        borderTopColor: '#2a2a2a',
        borderLeftColor: '#2a2a2a',
        borderRightColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
    },
    recessGradient: {
        flex: 1,
        padding: 3,
    },
    contentArea: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        justifyContent: 'flex-start',
        position: 'relative',
    },
    logoContainer: {
        position: 'absolute',
        bottom: 40, // Closer to buttons
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    logo: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 2,
        color: '#2a2a2a', // Subtle dark grey
        paddingVertical: 8,
        paddingHorizontal: 20,
        // Text shadow for embossed/carved effect
        textShadowColor: '#000000',
        textShadowOffset: { width: 0, height: -1 },
        textShadowRadius: 2,
    },
});
