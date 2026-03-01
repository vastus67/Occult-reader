import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { BOOK_REGISTRY } from '@/content/registry';
import { colors, spacing, radius, typography } from '@/theme/tokens';

export default function SourcesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.disclaimer}>
        Occult Library is an educational and historical reading tool for the study of public-domain texts.
        No instructions, coaching, or guidance for any activity is provided by this app.
        All texts are sourced from public-domain editions.
      </Text>

      <Text style={styles.sectionTitle}>Book Sources & Attribution</Text>
      {BOOK_REGISTRY.map((book) => (
        <View key={book.id} style={styles.card}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <View style={styles.row}><Text style={styles.label}>Author</Text><Text style={styles.value}>{book.author}</Text></View>
          {book.translator && (
            <View style={styles.row}><Text style={styles.label}>Translator</Text><Text style={styles.value}>{book.translator}</Text></View>
          )}
          <View style={styles.row}><Text style={styles.label}>Edition</Text><Text style={styles.value}>{book.edition}</Text></View>
          {book.publicationYear && (
            <View style={styles.row}><Text style={styles.label}>Published</Text><Text style={styles.value}>{book.publicationYear}</Text></View>
          )}
          <View style={styles.row}><Text style={styles.label}>Source</Text><Text style={styles.value}>{book.source}</Text></View>
          <View style={styles.row}>
            <Text style={styles.label}>License</Text>
            <Text style={[styles.value, styles.publicDomain]}>{book.licenseStatus}</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(book.sourceUrl)}>
            <Text style={styles.link}>{book.sourceUrl}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.legalBox}>
        <Text style={styles.legalTitle}>Legal Notice</Text>
        <Text style={styles.legalText}>
          All texts included in this application are in the public domain in the United States and,
          to the best of our knowledge, internationally. They are reproduced here for educational,
          historical, and scholarly purposes only.
          {'\n\n'}
          This application does not provide instructions, guidance, or coaching for any activity.
          It is a reader and study tool only.
          {'\n\n'}
          If you believe any content included here is subject to copyright, please contact us.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  disclaimer: {
    fontSize: typography.fontSizes.sm,
    color: colors.comment,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.sm * 1.6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  sectionTitle: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  bookTitle: { fontSize: typography.fontSizes.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 90, fontSize: typography.fontSizes.xs, color: colors.comment, fontWeight: '600' },
  value: { flex: 1, fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  publicDomain: { color: colors.green, fontWeight: '700' },
  link: { fontSize: typography.fontSizes.xs, color: colors.cyan, marginTop: spacing.xs, textDecorationLine: 'underline' },
  legalBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.border },
  legalTitle: { fontSize: typography.fontSizes.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  legalText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, lineHeight: typography.fontSizes.xs * 1.7 },
});
