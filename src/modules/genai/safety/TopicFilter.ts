/**
 * Topic Filter for AI Chat
 * Restricts questions to finance-related topics only
 */

export interface TopicFilterResult {
  isAllowed: boolean;
  reason?: string;
  suggestedResponse?: string;
}

// Finance-related keywords and phrases
const FINANCE_KEYWORDS = [
  // Money & Currency
  'money',
  'cash',
  'dollar',
  'rupee',
  'euro',
  'currency',
  'funds',
  // Transactions
  'transaction',
  'payment',
  'transfer',
  'deposit',
  'withdrawal',
  'spend',
  'spent',
  'spending',
  'purchase',
  'bought',
  'buy',
  'pay',
  'paid',
  'cost',
  'price',
  'charge',
  // Income & Expenses
  'income',
  'expense',
  'expenses',
  'earnings',
  'salary',
  'wage',
  'revenue',
  'bill',
  'bills',
  'rent',
  'mortgage',
  'loan',
  'debt',
  'credit',
  // Savings & Investment
  'save',
  'saving',
  'savings',
  'invest',
  'investment',
  'stock',
  'bond',
  'fund',
  'portfolio',
  'return',
  'interest',
  'dividend',
  // Budget & Planning
  'budget',
  'budgeting',
  'plan',
  'planning',
  'goal',
  'target',
  'limit',
  'afford',
  'financial',
  'finance',
  'finances',
  'fiscal',
  // Banking
  'bank',
  'account',
  'balance',
  'statement',
  'atm',
  'card',
  'debit',
  'credit card',
  // Categories
  'food',
  'grocery',
  'groceries',
  'restaurant',
  'dining',
  'shopping',
  'entertainment',
  'utility',
  'utilities',
  'insurance',
  'healthcare',
  'medical',
  'travel',
  'transport',
  'subscription',
  'membership',
  // Analysis
  'total',
  'sum',
  'average',
  'highest',
  'lowest',
  'most',
  'least',
  'how much',
  'how many',
  'breakdown',
  'summary',
  'report',
  'analysis',
  'analyze',
  'trend',
  'pattern',
  'compare',
  'category',
  'categories',
  // Time-based queries
  'today',
  'yesterday',
  'week',
  'month',
  'year',
  'daily',
  'weekly',
  'monthly',
  'annually',
  'last month',
  'this month',
  'last week',
  'this week',
];

// Explicitly off-topic keywords (things the model should NOT answer)
const OFF_TOPIC_KEYWORDS = [
  // General knowledge
  'who is',
  'what is the capital',
  'tell me about',
  'explain how',
  'history of',
  'when was',
  'where is',
  'why does',
  // Programming/Tech (unless finance app related)
  'write code',
  'programming',
  'javascript',
  'python',
  'algorithm',
  'how to code',
  'debug',
  'software',
  // Entertainment
  'movie',
  'song',
  'music',
  'game',
  'sport',
  'celebrity',
  'actor',
  'actress',
  'tv show',
  'netflix',
  'youtube',
  // General chat
  'joke',
  'story',
  'poem',
  'recipe',
  'weather',
  'news',
  'hello',
  'hi there',
  'how are you',
  'what can you do',
  // Harmful content
  'hack',
  'illegal',
  'bypass',
  'exploit',
];

// General questions that sound like they might be finance-related but aren't
const GENERAL_QUESTIONS = [
  /what('s| is) (today'?s? )?date/i,
  /what('s| is) the time/i,
  /what day is (it|today)/i,
  /what('s| is) the current (date|time)/i,
  /tell me the (date|time)/i,
];

// Greeting patterns that should get a contextual response
const GREETING_PATTERNS = [
  /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[\s!.,?]*$/i,
  /^what can you (do|help with)[\s?]*$/i,
  /^help[\s!?]*$/i,
  /^(who|what) are you[\s?]*$/i,
];

/**
 * Check if a message is finance-related
 */
const isFinanceRelated = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();

  // Check for finance keywords
  return FINANCE_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase()),
  );
};

/**
 * Check if a message is explicitly off-topic
 */
const isOffTopic = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();

  return OFF_TOPIC_KEYWORDS.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase()),
  );
};

/**
 * Check if message is a general question (not finance-specific)
 */
const isGeneralQuestion = (message: string): boolean => {
  return GENERAL_QUESTIONS.some(pattern => pattern.test(message));
};

/**
 * Check if message is a greeting
 */
const isGreeting = (message: string): boolean => {
  return GREETING_PATTERNS.some(pattern => pattern.test(message.trim()));
};

/**
 * Filter user message to determine if it should be processed
 */
export const filterTopic = (message: string): TopicFilterResult => {
  const trimmedMessage = message.trim();

  // Handle empty messages
  if (!trimmedMessage) {
    return {
      isAllowed: false,
      reason: 'Empty message',
    };
  }

  // Handle greetings with contextual response
  if (isGreeting(trimmedMessage)) {
    return {
      isAllowed: false,
      reason: 'greeting',
      suggestedResponse:
        "Hello! I'm your personal finance assistant. I can help you with:\n\n" +
        '• Analyzing your transactions and spending\n' +
        '• Showing your income and expenses\n' +
        '• Answering questions about your financial data\n' +
        '• Providing spending insights and summaries\n\n' +
        'What would you like to know about your finances?',
    };
  }

  // Handle general questions (like "what's today's date?")
  if (isGeneralQuestion(trimmedMessage)) {
    return {
      isAllowed: false,
      reason: 'general-question',
      suggestedResponse:
        "I'm your finance assistant and can only help with questions about your transactions and spending.\n\n" +
        'For finance-related date questions, try:\n' +
        '• "How much did I spend today?"\n' +
        '• "What were my expenses this week?"\n' +
        '• "Show transactions from last month"',
    };
  }

  // Check if explicitly off-topic
  if (isOffTopic(trimmedMessage) && !isFinanceRelated(trimmedMessage)) {
    return {
      isAllowed: false,
      reason: 'off-topic',
      suggestedResponse:
        "I'm specifically designed to help with your personal finances. " +
        'I can answer questions about your transactions, spending patterns, income, expenses, and budgeting.\n\n' +
        'Try asking something like:\n' +
        '• "How much did I spend this month?"\n' +
        '• "What\'s my total income?"\n' +
        '• "Show my biggest expenses"\n' +
        '• "What\'s my balance?"',
    };
  }

  // Check if finance-related
  if (isFinanceRelated(trimmedMessage)) {
    return { isAllowed: true };
  }

  // For ambiguous questions, allow but let the system prompt handle it
  // Short questions might be follow-ups to previous finance conversations
  if (trimmedMessage.length < 50) {
    return { isAllowed: true };
  }

  // Default: not clearly finance-related
  return {
    isAllowed: false,
    reason: 'not-finance-related',
    suggestedResponse:
      'I can only help with finance-related questions about your transactions and spending. ' +
      'Please ask me something about your financial data!',
  };
};

/**
 * Get current date formatted for the prompt
 */
const getCurrentDateInfo = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
};

/**
 * Get the restricted system prompt for the finance assistant
 */
export const getFinanceSystemPrompt = (transactionsContext: string): string => {
  const currentDate = getCurrentDateInfo();

  return `You are a finance assistant. Today is ${currentDate}.

YOUR TASK:
Analyze the transaction data below and answer the user's question. You must:
1. Filter transactions based on what they ask (today, yesterday, this week, this month, specific date, etc.)
2. Calculate totals (income, expenses, balance) from the filtered transactions
3. Provide a clear, specific answer with numbers

${transactionsContext}

INSTRUCTIONS:
• For "today" → Filter transactions with today's date and sum them
• For "yesterday" → Filter transactions from yesterday's date and sum them
• For "this week" → Filter transactions from the past 7 days and sum them
• For "this month" → Filter transactions from current month and sum them
• For "total/balance" → Sum ALL income, sum ALL expenses, calculate: income - expenses
• For specific categories → Filter by transaction name/description matching the category

CALCULATION EXAMPLES:
Q: "today expenses"
→ Find all EXPENSE transactions from today → Add their amounts → Report the total

Q: "yesterday income"
→ Find all INCOME transactions from yesterday → Add their amounts → Report the total

Q: "total balance"
→ Sum all INCOME amounts → Sum all EXPENSE amounts → Subtract: income - expenses

Q: "how much did I spend on groceries this month"
→ Find EXPENSE transactions this month with "grocery" or similar in name → Sum amounts

ANSWER FORMAT:
Be conversational and specific. Example:
"Today's expenses are ₹500.00. You spent ₹300 on Groceries and ₹200 on Transport."

Now analyze the data and answer the user's question accurately.`;
};

export const TopicFilter = {
  filter: filterTopic,
  isFinanceRelated,
  getFinanceSystemPrompt,
};
