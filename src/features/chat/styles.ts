import { StyleSheet } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
} from '../../shared/utils/scaling';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(10),
    color: '#666',
    fontSize: moderateScale(16),
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: scale(16),
    paddingBottom: verticalScale(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    color: '#999',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: scale(12),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#000000',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    padding: scale(12),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  loadingMessageText: {
    color: '#666',
    fontSize: moderateScale(14),
  },
  errorBubble: {
    alignSelf: 'center',
    backgroundColor: '#FFE5E5',
    padding: scale(12),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    maxWidth: '90%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: scale(12),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    marginRight: scale(8),
    maxHeight: verticalScale(100),
    fontSize: moderateScale(16),
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
