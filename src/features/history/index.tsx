import React, { useCallback } from 'react';
import { Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from '../../shared/components';
import { useAtom } from 'jotai';
import { transactionsAtom, Transaction } from '../../shared/atoms/transactions';
import { styles } from './styles';
import { deleteTransaction } from '../../shared/db/transactionsDB';
import { getDatabase } from '../../shared/db/database';

// Memoized transaction item component for better performance
const TransactionItem = React.memo(
  ({
    item,
    onDelete,
  }: {
    item: Transaction;
    onDelete: (id: string, name: string) => void;
  }) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return (
      <View
        style={[
          styles.transactionCard,
          item.type === 'income' ? styles.incomeCard : styles.expenseCard,
        ]}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <View style={styles.amountDeleteContainer}>
            <Text
              style={[
                styles.transactionAmount,
                item.type === 'income'
                  ? styles.incomeAmount
                  : styles.expenseAmount,
              ]}
            >
              {item.type === 'income' ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item.id, item.name)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    );
  },
);

const History = () => {
  const [transactions, setTransactions] = useAtom(transactionsAtom);

  // Memoized delete handler
  const handleDeleteTransaction = useCallback(
    async (id: string, name: string) => {
      Alert.alert(
        'Delete Transaction',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await deleteTransaction(id);
                if (success) {
                  setTransactions(transactions.filter(t => t.id !== id));
                } else {
                  Alert.alert('Error', 'Failed to delete transaction');
                }
              } catch (error) {
                console.error('Error deleting transaction:', error);
                Alert.alert('Error', 'Failed to delete transaction');
              }
            },
          },
        ],
      );
    },
    [transactions, setTransactions],
  );

  // Memoized clear all handler
  const handleClearAll = useCallback(() => {
    if (transactions.length === 0) return;

    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to delete ALL transactions? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase();
              db.execute('DELETE FROM transactions;');
              setTransactions([]);
              Alert.alert('Success', 'All transactions have been deleted');
            } catch (error) {
              console.error('Failed to clear transactions', error);
              Alert.alert('Error', 'Failed to clear transactions');
            }
          },
        },
      ],
    );
  }, [transactions.length, setTransactions]);

  // Memoized render item function
  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => {
      return <TransactionItem item={item} onDelete={handleDeleteTransaction} />;
    },
    [handleDeleteTransaction],
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Clear All button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        {transactions.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first transaction using the + button
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
};

export default History;
