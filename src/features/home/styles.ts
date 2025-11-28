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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: scale(20),
    paddingBottom: verticalScale(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    marginTop: verticalScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#000000',
  },
  profileButton: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: moderateScale(20),
  },
  heroSection: {
    backgroundColor: '#007AFF',
    borderRadius: moderateScale(16),
    padding: scale(24),
    marginBottom: verticalScale(24),
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: verticalScale(8),
  },
  balanceAmount: {
    fontSize: moderateScale(36),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceAmountNegative: {
    color: '#FF6B6B',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(24),
  },
  statCard: {
    flex: 1,
    borderRadius: moderateScale(12),
    padding: scale(20),
  },
  incomeCard: {
    backgroundColor: '#4CAF50',
  },
  expenseCard: {
    backgroundColor: '#FF6B6B',
  },
  statLabel: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: verticalScale(8),
  },
  statAmount: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  allTransactionsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  allTransactionsButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#007AFF',
  },
  chatButton: {
    position: 'absolute',
    bottom: verticalScale(20),
    right: scale(20),
    width: scale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  chatButtonText: {
    fontSize: moderateScale(24),
  },
});
