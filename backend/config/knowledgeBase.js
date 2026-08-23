// Rule-based response engine for common FAQ and issues
export const knowledgeBase = {
  // Order-related questions
  orderTracking: {
    keywords: ['track order', 'where is my order', 'order status', 'delivery time', 'when will arrive', 'track my order', 'order tracking', 'delivery status', 'how to track'],
    response: `To track your order:
1. Open the app and go to "My Orders"
2. Select the order you want to track
3. You'll see real-time location of delivery person
4. Chat with the delivery boy if needed

If you can't see your order, please provide your order ID and I can help further.`,
  },
  orderCancellation: {
    keywords: ['cancel order', 'want to cancel', 'stop order', 'cancel delivery'],
    response: `To cancel an order:
1. Go to "My Orders"
2. Find the order you want to cancel
3. If order hasn't been accepted by shop yet, you can cancel directly
4. If order is being prepared, contact the shop to discuss

Note: Orders can only be cancelled before the delivery partner is assigned. Cancellation refund takes 3-5 business days.`,
  },
  orderPayment: {
    keywords: ['payment failed', 'payment issue', 'charge twice', 'billing problem', 'how to pay', 'payment method', 'payment for order', 'how to do payment', 'payment options', 'payment through', 'debit card', 'credit card', 'card payment', 'upi', 'wallet', 'razorpay', 'payment modes'],
    response: `Payment options available on Vingo:
1. **Credit/Debit Card** - Visa, Mastercard accepted
2. **UPI** - Google Pay, PhonePe, Paytm, BHIM
3. **Digital Wallets** - Paytm, Amazon Pay
4. **Cash on Delivery** - Available in select areas
5. **Vingo Wallet** - Load money and pay instantly

**How to pay:**
1. Add items to cart
2. Go to Checkout
3. Select your preferred payment method
4. Complete the transaction

For payment failures, try a different method or contact support.`,
  },

  // Account and Login
  login: {
    keywords: ['cant login', 'forgot password', 'reset password', 'account locked'],
    response: `Password reset:
1. Click "Forgot Password" on login page
2. Enter your registered email
3. Check your email for reset link (check spam folder too)
4. Create a new password and login

If you're still locked out, try:
- Clear app cache and restart
- Update the app to latest version
- Contact support for account recovery`,
  },
  signup: {
    keywords: ['create account', 'sign up', 'register', 'new account'],
    response: `Getting started with Vingo:
1. Download/open the app
2. Tap "Sign Up"
3. Choose your role: Customer, Shop Owner, or Delivery Boy
4. Enter your email and create password
5. Verify your email
6. Complete your profile
7. Start ordering or delivering!

Need help? Contact support@vingo.com`,
  },

  // Delivery-related
  deliveryTime: {
    keywords: ['how long delivery', 'delivery time', 'how fast', 'delivery speed'],
    response: `Delivery time depends on:
- Distance from shop to your location (usually 20-45 mins)
- Current order volume
- Traffic conditions
- Time of day (peak hours: 12-2 PM, 7-9 PM)

You can see the estimated time when placing an order. Real-time tracking available once delivery boy is assigned!`,
  },
  deliveryFee: {
    keywords: ['delivery charge', 'delivery fee', 'extra cost', 'why is delivery expensive', 'how much delivery', 'delivery cost'],
    response: `Delivery fees are calculated based on:
- Distance (typically ₹20-₹100)
- Order value (free delivery on orders above ₹500)
- Peak hour surcharge (during busy times)
- Weather conditions

You see the exact fee before confirming your order. All prices are transparent, no hidden charges!`,
  },

  // Food and Orders
  foodQuality: {
    keywords: ['food quality', 'stale food', 'cold food', 'bad quality', 'poor quality', 'food complaint'],
    response: `We're sorry to hear your food wasn't fresh! Here's what we can do:
1. Rate and review the shop (helps others)
2. Open the order and report the issue
3. We'll connect you with the shop for replacement/refund
4. If unresolved, we'll refund through your Vingo wallet

Your satisfaction matters - let's fix this!`,
  },
  itemUnavailable: {
    // 'unavailable' deliberately excluded as a bare keyword: it's a
    // substring of "available", so a normal "what's available" question
    // was fuzzy-matching this category via the word-based fallback.
    keywords: ['item not available', 'out of stock', 'not available', 'sold out'],
    response: `Items may be unavailable due to:
- Stock running out (popular items)
- Shop temporarily closed
- Delivery limit reached
- Item discontinued

Try:
1. Browse similar items from the same shop
2. Check other nearby shops for same item
3. Save the item for later to get notified when available

The shop usually restocks soon!`,
  },

  // Refunds and Issues
  refund: {
    keywords: ['refund', 'money back', 'return money', 'reimbursement'],
    response: `Refund process:
1. Report the issue on your order
2. We'll investigate (usually within 24 hours)
3. Approved refunds go to your Vingo Wallet first (instant)
4. Withdraw to bank within 7 days (no extra charges)

Typical reasons: Wrong order, food quality, delivery failure

Processing time: 24-48 hours typically`,
  },

  // Reels and Social
  uploadReel: {
    keywords: ['upload reel', 'how to upload', 'post video', 'create reel'],
    response: `How to upload a food reel:
1. Go to "My Reels" tab
2. Tap "Upload Reel"
3. Record/select a video (15-60 seconds)
4. Add a caption and tags
5. Choose which shop/food to feature
6. Post!

Tips for viral reels:
- Show food preparation or unboxing
- Use trending sounds
- Add engaging captions
- Post during peak hours (7-10 PM)`,
  },

  // Promotions
  promo: {
    keywords: ['coupon', 'promo code', 'discount', 'offer', 'promotion'],
    response: `Getting discounts on Vingo:
1. Check "Offers" section in app (curated for you)
2. Enter promo codes at checkout
3. Subscribe to push notifications for flash sales
4. Refer friends for credits
5. Use Vingo Wallet for faster checkout

Current popular codes: 
- FIRST50: 50% off on first order
- REFER20: ₹20 credit when referral completes

Check app for more active offers!`,
  },

  // Technical Issues
  appCrash: {
    keywords: ['app crashes', 'app not working', 'frozen', 'bug', 'glitch'],
    response: `App not working? Try these fixes:
1. Force close and restart the app
2. Clear app cache (Settings > Apps > Vingo > Storage > Clear Cache)
3. Restart your phone
4. Update to latest version from Play Store/App Store
5. Check internet connection (use WiFi if possible)

Still having issues?
- Report the error with screenshots
- Reinstall the app if nothing works
- Contact support: support@vingo.com`,
  },
};

/**
 * Check if user message matches any knowledge base rules
 * Uses intelligent matching with multiple strategies:
 * 1. Direct keyword matching
 * 2. Word-based matching for flexibility
 * @param {string} userMessage - The user's message
 * @returns {Object|null} - Matching response or null
 */
export const findRuleBasedResponse = (userMessage) => {
  const lowercaseMessage = userMessage.toLowerCase();
  const messageWords = lowercaseMessage.split(/\s+/); // Split into words

  let bestMatch = null;
  let bestMatchScore = 0;

  for (const category in knowledgeBase) {
    const { keywords, response } = knowledgeBase[category];
    let matchScore = 0;

    // Strategy 1: Direct substring match (highest priority)
    for (const keyword of keywords) {
      if (lowercaseMessage.includes(keyword.toLowerCase())) {
        matchScore += 2; // Higher score for direct match
      }
    }

    // Strategy 2: Word-based matching (for better flexibility, e.g. "track"
    // vs "tracking"). Substring containment is only applied to words of 4+
    // characters — otherwise short filler words like "i" or "my" trivially
    // match almost any keyword ("track".includes("i") is true), which was
    // causing ordinary sentences to spuriously match unrelated categories.
    if (matchScore === 0) {
      for (const keyword of keywords) {
        const keywordWords = keyword.toLowerCase().split(/\s+/);
        const allWordsPresent = keywordWords.every((kw) =>
          messageWords.some((w) => {
            if (w === kw) return true;
            if (w.length < 4 || kw.length < 4) return false;
            return w.includes(kw) || kw.includes(w);
          })
        );
        if (allWordsPresent) {
          matchScore += 1;
        }
      }
    }

    // Keep track of best match
    if (matchScore > bestMatchScore) {
      bestMatchScore = matchScore;
      bestMatch = {
        response,
        source: 'rule-based',
        category,
      };
    }
  }

  return bestMatch; // Return best match or null
};

/**
 * Generate a fallback response when no match is found
 */
export const generateFallbackResponse = () => {
  return {
    response: `I'm here to help! I can assist you with:
- Order tracking and delivery issues
- Payment and refund problems
- Account and login help
- Food quality complaints
- Promotions and discounts
- App technical issues

What can I help you with today?`,
    source: 'fallback',
  };
};
