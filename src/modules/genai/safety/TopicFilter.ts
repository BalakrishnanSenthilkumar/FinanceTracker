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

  return `You are a STRICTLY finance-focused assistant for a personal finance tracking app.

CURRENT DATE: ${currentDate}

IMPORTANT RULES:
1. You can ONLY answer questions related to:
   - The user's transaction data provided below
   - Personal finance topics (budgeting, spending, saving, income, expenses)
   - Analysis of the user's financial patterns

2. You must REFUSE to answer questions about:
   - General knowledge (history, science, geography, etc.)
   - Programming or technical topics  
   - Entertainment, news, or current events
   - The current date/time (just say you focus on finances)
   - Any topic not related to personal finance

3. If asked an off-topic question, respond ONLY with:
   "I can only help with questions about your finances and transactions. What would you like to know about your spending or income?"

4. Base your answers ONLY on the transaction data provided. Do not make up or assume data.

5. Be concise and provide specific numbers when relevant.

6. Use the current date above to understand time-relative questions like "today", "this week", "this month".

USER'S FINANCIAL DATA:
${transactionsContext}

Remember: Stay strictly on topic. Only discuss the user's finances and the data above.`;
};

export const TopicFilter = {
  filter: filterTopic,
  isFinanceRelated,
  getFinanceSystemPrompt,
};
