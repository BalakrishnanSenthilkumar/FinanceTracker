import { StyleSheet } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
} from '../../../shared/utils/scaling';

export const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: scale(20),
    paddingBottom: verticalScale(20),
    maxHeight: '90%',
    minHeight: '50%',
  },
  swipeIndicator: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: '#E0E0E0',
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginBottom: verticalScale(16),
  },
  scrollView: {
    maxHeight: verticalScale(400),
  },
  scrollContent: {
    paddingBottom: verticalScale(10),
  },
  modalTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  label: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(8),
    color: '#000000',
  },
  required: {
    color: '#FF6B6B',
    fontSize: moderateScale(16),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(16),
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: scale(12),
  },
  incomeButton: {
    borderColor: '#E8F5E9',
    backgroundColor: '#F1F8F4',
  },
  incomeButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  expenseButton: {
    borderColor: '#FFEBEE',
    backgroundColor: '#FFF5F5',
  },
  expenseButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFEBEE',
    borderWidth: 3,
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  typeButtonIcon: {
    marginBottom: verticalScale(4),
  },
  typeButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
  },
  incomeButtonTextActive: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  expenseButtonTextActive: {
    color: '#C62828',
    fontWeight: '800',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(20),
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
