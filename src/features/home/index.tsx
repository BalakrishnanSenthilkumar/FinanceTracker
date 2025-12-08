import React, { useEffect } from 'react';
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

  useEffect(() => {
    getTransactions()
      .then(transactions => {
        // console.log('transactions', transactions);
        // Update the transactions atom - derived atoms will recalculate automatically
        setTransactions(transactions);
      })
      .catch(err => {
        console.error('Failed to fetch transactions', err);
      });
  }, [setTransactions]);

  // Calculate chat button position: tab bar height (60) + tab bar bottom padding + spacing (16)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(Math.abs(amount));
  };

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
            onPress={() => {
              // Navigate to Profile using parent navigator
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate('Profile');
              }
            }}
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
            {formatCurrency(totalBalance)}
          </Text>
        </View>

        {/* Income and Expense Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statAmount}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.statCard, styles.expenseCard]}>
            <Text style={styles.statLabel}>Total Expense</Text>
            <Text style={styles.statAmount}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {/* All Transactions Button */}
        <TouchableOpacity
          style={styles.allTransactionsButton}
          onPress={() => {
            // Navigate to History - handled by bottom tab navigation
            navigation.navigate('History');
          }}
        >
          <Text style={styles.allTransactionsButtonText}>All Transactions</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Chat Button - Bottom Right */}
      {isAiChatEnabled && (
        <TouchableOpacity
          style={[styles.chatButton]}
          onPress={() => {
            // Navigate to Chat using parent navigator
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate('Chat');
            }
          }}
        >
          <Text style={styles.chatButtonText}>💬</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Home;
