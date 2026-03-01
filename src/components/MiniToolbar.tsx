import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/theme/tokens';

interface ToolbarAction {
  label: string;
  icon: string;
  onPress: () => void;
}

interface Props {
  actions: ToolbarAction[];
}

export function MiniToolbar({ actions }: Props) {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity key={action.label} style={styles.btn} onPress={action.onPress}>
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: 32,
    justifyContent: 'space-around',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  btn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
  },
});
