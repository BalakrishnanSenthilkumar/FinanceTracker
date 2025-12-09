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
  profileHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: verticalScale(32),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: scale(80),
    height: verticalScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  avatarText: {
    fontSize: moderateScale(40),
  },
  profileName: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: verticalScale(4),
  },
  profileEmail: {
    fontSize: moderateScale(16),
    color: '#666',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: verticalScale(16),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemText: {
    fontSize: moderateScale(16),
    color: '#000000',
  },
  menuItemArrow: {
    fontSize: moderateScale(24),
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutSection: {
    marginTop: verticalScale(32),
    paddingHorizontal: scale(20),
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(52),
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: moderateScale(12),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
});
