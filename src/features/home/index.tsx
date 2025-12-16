import React, { useEffect, useCallback, useMemo } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from '../../shared/components';
import { useAtom } from 'jotai';
import {
  totalBalanceAtom,
  totalIncomeAtom,
  totalExpenseAtom,
  transactionsAtom,
} from '../../shared/atoms/transactions';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from './styles';
import { getTransactions } from '../../shared/db/transactionsDB';
import { useIsFeatureEnabled } from '../../core/config/featureFlags';

type TabParamList = {
  Home: undefined;
  History: undefined;
  Add: undefined;
};

type RootStackParamList = {
  HomeTab: undefined;
  Chat: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [totalBalance] = useAtom(totalBalanceAtom);
  const [totalIncome] = useAtom(totalIncomeAtom);
  const [totalExpense] = useAtom(totalExpenseAtom);
  const [, setTransactions] = useAtom(transactionsAtom);

  // Feature flag - reactive, re-renders if flag changes at runtime
  const isAiChatEnabled = useIsFeatureEnabled('features.aiChat');

  // Memoized currency formatter - create once, reuse across renders
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(Math.abs(amount));
  }, []);

  // Memoized formatted values to avoid recalculating on every render
  const formattedBalance = useMemo(
    () => formatCurrency(totalBalance),
    [totalBalance, formatCurrency],
  );
  const formattedIncome = useMemo(
    () => formatCurrency(totalIncome),
    [totalIncome, formatCurrency],
  );
  const formattedExpense = useMemo(
    () => formatCurrency(totalExpense),
    [totalExpense, formatCurrency],
  );

  // Load transactions on mount
  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        const transactions = await getTransactions();
        if (isMounted) {
          setTransactions(transactions);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [setTransactions]);

  // Memoized navigation handlers to prevent unnecessary re-renders
  const handleProfilePress = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Profile');
    }
  }, [navigation]);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const handleChatPress = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Chat');
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header with Profile Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finance Tracker</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section - Total Balance */}
        <View style={styles.heroSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text
            style={[
              styles.balanceAmount,
              totalBalance < 0 && styles.balanceAmountNegative,
            ]}
          >
            {formattedBalance}
          </Text>
        </View>

        {/* Income and Expense Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statAmount}>{formattedIncome}</Text>
          </View>
          <View style={[styles.statCard, styles.expenseCard]}>
            <Text style={styles.statLabel}>Total Expense</Text>
            <Text style={styles.statAmount}>{formattedExpense}</Text>
          </View>
        </View>

        {/* All Transactions Button */}
        <TouchableOpacity
          style={styles.allTransactionsButton}
          onPress={handleHistoryPress}
        >
          <Text style={styles.allTransactionsButtonText}>All Transactions</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Chat Button - Bottom Right */}
      {isAiChatEnabled && (
        <TouchableOpacity style={[styles.chatButton]} onPress={handleChatPress}>
          <Text style={styles.chatButtonText}>💬</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Home;
