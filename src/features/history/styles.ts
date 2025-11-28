import { StyleSheet } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
} from '../../shared/utils/scaling';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: scale(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#666',
    marginBottom: verticalScale(8),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderLeftWidth: scale(4),
  },
  incomeCard: {
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftColor: '#FF6B6B',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  transactionName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  transactionAmount: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#FF6B6B',
  },
  transactionDescription: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: verticalScale(8),
  },
  transactionDate: {
    fontSize: moderateScale(12),
    color: '#999',
  },
});
