import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
export function Button({ title, onPress, disabled = false, secondary = false, style }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; style?: StyleProp<ViewStyle> }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[ui.button, secondary && ui.secondary, disabled && { opacity: 0.4 }, style]}><Text style={[ui.buttonText, secondary && { color: '#222' }]}>{title}</Text></Pressable>;
}
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 12, color: '#222' },
  text: { fontSize: 14, lineHeight: 22, color: '#555', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, color: '#222' },
  button: { backgroundColor: '#222', borderRadius: 10, padding: 15, alignItems: 'center', marginVertical: 6 },
  secondary: { backgroundColor: '#f2f2f2' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  error: { color: '#b42318', fontSize: 13, lineHeight: 20, marginVertical: 10 },
});
