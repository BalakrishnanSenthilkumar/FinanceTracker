import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { useAtom } from 'jotai';
import {
  transactionsAtom,
  Transaction,
} from '../../../shared/atoms/transactions';
import { styles } from './styles';
import { moderateScale } from '../../../shared/utils/scaling';
import { IncomeIcon, ExpenseIcon } from '../../../shared/components/icons';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
}) => {
  const [transactions, setTransactions] = useAtom(transactionsAtom);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert(
        'Missing Information',
        'Please fill in the transaction name and amount to continue.',
      );
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount greater than zero.',
      );
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      amount: amountValue,
      description: description.trim() || '',
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);

    // Reset form
    setName('');
    setAmount('');
    setDescription('');
    setType('income');

    onClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setDescription('');
    setType('income');
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.2}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      propagateSwipe={true}
      hasBackdrop={true}
      useNativeDriver={false}
      useNativeDriverForBackdrop
    >
      <View style={styles.modalContent}>
        <View style={styles.swipeIndicator} />

        <Text style={styles.modalTitle}>Track Your Money</Text>
        <Text style={styles.modalSubtitle}>
          Every transaction counts towards your financial goals
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>
            What's this transaction for? <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Grocery shopping, Salary, Coffee"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>
            Is this money income or an expense?{' '}
            <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                styles.incomeButton,
                type === 'income' && styles.incomeButtonActive,
              ]}
              onPress={() => setType('income')}
            >
              <View style={styles.typeButtonIcon}>
                <IncomeIcon
                  size={moderateScale(28)}
                  color={type === 'income' ? '#2E7D32' : '#4CAF50'}
                />
              </View>
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.incomeButtonTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                styles.expenseButton,
                type === 'expense' && styles.expenseButtonActive,
              ]}
              onPress={() => setType('expense')}
            >
              <View style={styles.typeButtonIcon}>
                <ExpenseIcon
                  size={moderateScale(28)}
                  color={type === 'expense' ? '#C62828' : '#FF6B6B'}
                />
              </View>
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.expenseButtonTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            How much? <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Add a note (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Remember why you spent this money or where it came from..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Save Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;
