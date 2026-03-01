import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getBook, getChapters, getPassages, addHighlight, removeHighlight,
  addNote, addBookmark, removeBookmark,
} from '@/db/queries';
import type { Book, Chapter, Passage } from '@/db/queries';
import { colors, spacing, radius, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';

export default function ReaderScreen() {
  const { id, chapterId: startChapterId } = useLocalSearchParams<{ id: string; chapterId?: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [typographyVisible, setTypographyVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const listRef = useRef<FlatList>(null);
  const { verseMode, fontSize, lineHeight, margin, fontFamily, theme, updateReadingProgress } = useAppStore();

  const isDracula = theme === 'dracula';
  const bg = isDracula ? colors.background : colors.sepia.background;
  const textColor = isDracula ? colors.textPrimary : colors.sepia.textPrimary;

  useEffect(() => {
    async function load() {
      const [b, chs] = await Promise.all([getBook(id), getChapters(id)]);
      setBook(b);
      setChapters(chs);
      if (chs.length > 0) {
        const target = startChapterId ? chs.find((c) => c.id === startChapterId) ?? chs[0] : chs[0];
        setSelectedChapter(target);
        const ps = await getPassages(target.id);
        setPassages(ps);
      }
      setLoading(false);
    }
    load();
  }, [id, startChapterId]);

  const switchChapter = async (chapter: Chapter) => {
    setLoading(true);
    setSelectedChapter(chapter);
    const ps = await getPassages(chapter.id);
    setPassages(ps);
    setChapterModalVisible(false);
    setLoading(false);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handlePassageTap = (passage: Passage) => {
    setSelectedPassage(passage);
    setToolbarVisible(true);
  };

  const handleHighlight = async (colorKey: string) => {
    if (!selectedPassage) return;
    if (highlights.has(selectedPassage.id)) {
      await removeHighlight(selectedPassage.id);
      setHighlights((prev) => { const s = new Set(prev); s.delete(selectedPassage.id); return s; });
    } else {
      await addHighlight(selectedPassage.id, colorKey);
      setHighlights((prev) => new Set(prev).add(selectedPassage.id));
    }
    setToolbarVisible(false);
  };

  const handleBookmark = async () => {
    if (!selectedPassage) return;
    if (bookmarked.has(selectedPassage.id)) {
      await removeBookmark(selectedPassage.id);
      setBookmarked((prev) => { const s = new Set(prev); s.delete(selectedPassage.id); return s; });
    } else {
      await addBookmark(selectedPassage.id);
      setBookmarked((prev) => new Set(prev).add(selectedPassage.id));
    }
    setToolbarVisible(false);
  };

  const handleAddNote = async () => {
    if (!selectedPassage || !noteText.trim()) return;
    await addNote(selectedPassage.id, noteText.trim());
    setNoteText('');
    setNoteModalVisible(false);
    setToolbarVisible(false);
    Alert.alert('Note saved');
  };

  const renderPassage = useCallback(({ item }: { item: Passage }) => {
    const isHighlighted = highlights.has(item.id);
    const isBookmarkedItem = bookmarked.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => handlePassageTap(item)}
        style={[
          styles.passage,
          { marginHorizontal: margin, backgroundColor: isHighlighted ? colors.highlights.yellow : 'transparent' },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.passageRow}>
          {verseMode && (
            <Text style={[styles.passageNum, { color: isDracula ? colors.comment : colors.sepia.textMuted }]}>
              {item.number}
            </Text>
          )}
          <Text
            style={[
              styles.passageText,
              {
                fontSize,
                lineHeight: fontSize * lineHeight,
                color: textColor,
                fontFamily: fontFamily === 'serif' ? 'Georgia' : fontFamily === 'mono' ? 'Courier New' : undefined,
                flex: 1,
              },
            ]}
          >
            {item.text}
          </Text>
          {isBookmarkedItem && <Text style={styles.bookmarkIcon}>🔖</Text>}
        </View>
      </TouchableOpacity>
    );
  }, [highlights, bookmarked, verseMode, fontSize, lineHeight, fontFamily, margin, isDracula, textColor]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: bg }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => setChapterModalVisible(true)} style={styles.chapterSelector}>
          <Text style={[styles.chapterSelectorText, { color: textColor }]} numberOfLines={1}>
            {selectedChapter?.title ?? 'Select Chapter'}
          </Text>
          <Text style={{ color: colors.comment }}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTypographyVisible(true)} style={styles.headerBtn}>
          <Text style={{ color: colors.comment, fontSize: 18 }}>Aa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={passages}
        keyExtractor={(p) => p.id}
        renderItem={renderPassage}
        contentContainerStyle={{ paddingVertical: spacing.xl }}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0 && selectedChapter) {
            const p = viewableItems[0].item as Passage;
            updateReadingProgress(id, selectedChapter.id, p.id, 0);
          }
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* Mini Toolbar */}
      <Modal transparent visible={toolbarVisible} animationType="fade" onRequestClose={() => setToolbarVisible(false)}>
        <TouchableOpacity style={styles.toolbarOverlay} activeOpacity={1} onPress={() => setToolbarVisible(false)}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleHighlight('yellow')}>
              <Text style={styles.toolbarBtnText}>🟡 Highlight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={() => setNoteModalVisible(true)}>
              <Text style={styles.toolbarBtnText}>📝 Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleBookmark}>
              <Text style={styles.toolbarBtnText}>
                {selectedPassage && bookmarked.has(selectedPassage.id) ? '🔖 Remove' : '🔖 Bookmark'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Note Modal */}
      <Modal visible={noteModalVisible} animationType="slide" transparent onRequestClose={() => setNoteModalVisible(false)}>
        <View style={styles.noteModalBg}>
          <View style={styles.noteModal}>
            <Text style={styles.noteModalTitle}>Add Note</Text>
            {selectedPassage && (
              <Text style={styles.notePassageRef} numberOfLines={2}>
                "{selectedPassage.text.substring(0, 80)}…"
              </Text>
            )}
            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here…"
              placeholderTextColor={colors.textMuted}
              multiline
              value={noteText}
              onChangeText={setNoteText}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)} style={styles.noteCancelBtn}>
                <Text style={styles.noteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddNote} style={styles.noteSaveBtn}>
                <Text style={styles.noteSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chapter Modal */}
      <Modal visible={chapterModalVisible} animationType="slide" transparent onRequestClose={() => setChapterModalVisible(false)}>
        <View style={styles.chapterModalBg}>
          <View style={styles.chapterModal}>
            <Text style={styles.chapterModalTitle}>Chapters</Text>
            <ScrollView>
              {chapters.map((ch) => (
                <TouchableOpacity key={ch.id} style={styles.chapterItem} onPress={() => switchChapter(ch)}>
                  <Text style={styles.chapterItemNum}>{ch.number}</Text>
                  <Text style={[styles.chapterItemTitle, selectedChapter?.id === ch.id && styles.chapterItemActive]}>
                    {ch.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setChapterModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Typography Modal */}
      <Modal visible={typographyVisible} animationType="slide" transparent onRequestClose={() => setTypographyVisible(false)}>
        <TypographyPanel onClose={() => setTypographyVisible(false)} />
      </Modal>
    </View>
  );
}

function TypographyPanel({ onClose }: { onClose: () => void }) {
  const { fontSize, lineHeight, margin, fontFamily, theme, setFontSize, setLineHeight, setFontFamily, setTheme } = useAppStore();
  return (
    <View style={styles.typographyBg}>
      <View style={styles.typographyPanel}>
        <Text style={styles.typographyTitle}>Typography</Text>

        <Text style={styles.typographyLabel}>Font Size: {fontSize}px</Text>
        <View style={styles.typographyRow}>
          <TouchableOpacity style={styles.typoBtn} onPress={() => setFontSize(Math.max(12, fontSize - 1))}>
            <Text style={styles.typoBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.typoBtn} onPress={() => setFontSize(Math.min(28, fontSize + 1))}>
            <Text style={styles.typoBtnText}>A+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.typographyLabel}>Line Height</Text>
        <View style={styles.typographyRow}>
          {[1.3, 1.6, 1.9, 2.2].map((lh) => (
            <TouchableOpacity key={lh} style={[styles.typoBtn, lineHeight === lh && styles.typoBtnActive]} onPress={() => setLineHeight(lh)}>
              <Text style={[styles.typoBtnText, lineHeight === lh && styles.typoBtnTextActive]}>{lh}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.typographyLabel}>Font</Text>
        <View style={styles.typographyRow}>
          {(['serif', 'sans', 'mono'] as const).map((f) => (
            <TouchableOpacity key={f} style={[styles.typoBtn, fontFamily === f && styles.typoBtnActive]} onPress={() => setFontFamily(f)}>
              <Text style={[styles.typoBtnText, fontFamily === f && styles.typoBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.typographyLabel}>Theme</Text>
        <View style={styles.typographyRow}>
          {(['dracula', 'candle'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.typoBtn, theme === t && styles.typoBtnActive]} onPress={() => setTheme(t)}>
              <Text style={[styles.typoBtnText, theme === t && styles.typoBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chapterSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  chapterSelectorText: { fontSize: typography.fontSizes.base, fontWeight: '600', flex: 1 },
  headerBtn: { paddingHorizontal: spacing.sm },
  passage: { paddingVertical: spacing.sm, borderRadius: radius.sm },
  passageRow: { flexDirection: 'row', alignItems: 'flex-start' },
  passageNum: { width: 28, fontSize: typography.fontSizes.xs, fontWeight: '700', paddingTop: 3 },
  passageText: {},
  bookmarkIcon: { paddingLeft: 4, paddingTop: 2 },

  // Toolbar
  toolbarOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: 32,
    justifyContent: 'space-around',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  toolbarBtn: { alignItems: 'center', padding: spacing.sm },
  toolbarBtnText: { color: colors.textPrimary, fontSize: typography.fontSizes.sm },

  // Note modal
  noteModalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  noteModal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: 40 },
  noteModalTitle: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  notePassageRef: { fontSize: typography.fontSizes.sm, color: colors.comment, fontStyle: 'italic', marginBottom: spacing.md },
  noteInput: { backgroundColor: colors.card, color: colors.textPrimary, borderRadius: radius.md, padding: spacing.md, minHeight: 100, fontSize: typography.fontSizes.base, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md, gap: spacing.sm },
  noteCancelBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  noteCancelText: { color: colors.textSecondary, fontSize: typography.fontSizes.base },
  noteSaveBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
  noteSaveText: { color: '#fff', fontWeight: '700', fontSize: typography.fontSizes.base },

  // Chapter modal
  chapterModalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  chapterModal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '70%' },
  chapterModalTitle: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  chapterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  chapterItemNum: { width: 32, color: colors.comment, fontSize: typography.fontSizes.sm, fontWeight: '700' },
  chapterItemTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.fontSizes.base },
  chapterItemActive: { color: colors.primary, fontWeight: '700' },
  closeBtn: { marginTop: spacing.md, alignItems: 'center', padding: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md },
  closeBtnText: { color: colors.primary, fontWeight: '700' },

  // Typography panel
  typographyBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  typographyPanel: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: 40 },
  typographyTitle: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  typographyLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  typographyRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  typoBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.card, borderRadius: radius.md, minWidth: 48, alignItems: 'center' },
  typoBtnActive: { backgroundColor: colors.primary },
  typoBtnText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
  typoBtnTextActive: { color: '#fff', fontWeight: '700' },
});
