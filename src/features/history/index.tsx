import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { SafeAreaView } from '../../shared/components';
import { useAtom } from 'jotai';
import { transactionsAtom, Transaction } from '../../shared/atoms/transactions';
import { styles } from './styles';

const History = () => {
  const [transactions] = useAtom(transactionsAtom);

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

  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <View
        style={[
          styles.transactionCard,
          item.type === 'income' ? styles.incomeCard : styles.expenseCard,
        ]}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionName}>{item.name}</Text>
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
        </View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default History;
