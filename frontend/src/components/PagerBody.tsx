import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ButtonGrid } from './ButtonGrid';
import { StatusLEDs } from './StatusLEDs';

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
        <View style={styles.container}>
            <StatusLEDs />
            <ButtonGrid
                onSelect={onSelect}
                onBack={onBack}
                onNavigateUp={onNavigateUp}
                onNavigateDown={onNavigateDown}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#dadadaff',
        borderWidth: 3,
        borderBottomColor: '#dadadaff',
        borderColor: '#343434ff',

        borderRadius: 16,
        padding: 20,
        height: '40%',
        paddingTop: 40
    },
});
