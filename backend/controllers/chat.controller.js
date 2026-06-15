import ChatMessage from '../models/chat.model.js';
import { findRuleBasedResponse, generateFallbackResponse } from '../config/knowledgeBase.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Get chat history for a session
 * GET /api/chat/history/:sessionId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await ChatMessage.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.status(200).json({
      success: true,
      sessionId,
      messages: chatSession.messages,
      lastInteraction: chatSession.lastInteraction,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send a message and get bot response
 * POST /api/chat/message
 */
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, userId, userMessage, userRole, currentPage } = req.body;

    if (!sessionId || !userMessage) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and userMessage are required',
      });
    }

    // Find or create chat session
    let chatSession = await ChatMessage.findOne({ sessionId });

    if (!chatSession) {
      chatSession = new ChatMessage({
        sessionId,
        userId: userId || null,
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          context: {
            userRole,
            currentPage,
          },
        },
        messages: [],
      });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Update context
    chatSession.metadata.context.userRole = userRole || chatSession.metadata.context.userRole;
    chatSession.metadata.context.currentPage =
      currentPage || chatSession.metadata.context.currentPage;
    chatSession.lastInteraction = new Date();

    // Step 1: Try to find a rule-based response
    let ruleResponse = findRuleBasedResponse(userMessage);

    let botMessage = ruleResponse?.response;
    let responseSource = ruleResponse?.source || 'rule-based';

    console.log(`[CHAT] Rule match: ${ruleResponse ? ruleResponse.category : 'none'}`);

    // Step 2: If no rule match, use Gemini AI for intelligent response
    if (!ruleResponse) {
      console.log('[CHAT] No rule match, calling Gemini AI...');
      const aiResponse = await getGeminiResponse(userMessage, chatSession.messages);
      
      if (aiResponse) {
        botMessage = aiResponse;
        responseSource = 'ai';
        console.log('[CHAT] AI response received successfully');
      } else {
        console.log('[CHAT] AI response failed, using fallback');
      }
    }

    // Step 3: If both fail, use fallback
    if (!botMessage) {
      console.log('[CHAT] Both rule and AI failed, using fallback');
      const fallback = generateFallbackResponse();
      botMessage = fallback.response;
      responseSource = fallback.source;
    }

    // Add bot message
    chatSession.messages.push({
      role: 'bot',
      content: botMessage,
      timestamp: new Date(),
    });

    // Save to database
    await chatSession.save();

    res.status(200).json({
      success: true,
      message: botMessage,
      source: responseSource,
      sessionId,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get Gemini AI response
 */
async function getGeminiResponse(userMessage, conversationHistory) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return null;
    }

    // Build context from recent messages
    const recentMessages = conversationHistory.slice(-10); // Last 10 messages for context
    let conversationContext = '';

    if (recentMessages.length > 0) {
      conversationContext = 'Previous conversation:\n';
      recentMessages.forEach((msg) => {
        conversationContext += `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    const systemPrompt = `You are a helpful customer support chatbot for Vingo, a food delivery and social platform app. 
You help users with:
- Order tracking and delivery issues
- Payment and refund problems  
- Account and login help
- Food quality complaints
- Reels and social features
- Promotions and discounts
- App technical issues

Be concise, friendly, and professional. Keep responses to 2-3 sentences when possible. 
If you need specific order details, ask the user for their order ID.
Always prioritize user satisfaction and offer solutions.

${conversationContext}

Now respond to the current customer message. Be helpful and provide actionable solutions.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt + '\n\nCustomer: ' + userMessage,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        },
      }),
    });

    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return null;
    }

    // Extract text from Gemini response
    if (
      data.candidates &&
      data.candidates[0]?.content?.parts?.[0]?.text
    ) {
      const botResponse = data.candidates[0].content.parts[0].text;
      console.log('Gemini response received:', botResponse.substring(0, 100));
      return botResponse;
    }

    console.warn('Unexpected Gemini response structure:', JSON.stringify(data).substring(0, 200));
    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    return null;
  }
}

/**
 * Clear chat history (for user privacy)
 * DELETE /api/chat/history/:sessionId
 */
export const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatMessage.deleteOne({ sessionId });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get user's chat sessions (authenticated users)
 * GET /api/chat/sessions
 */
export const getUserChatSessions = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    const sessions = await ChatMessage.find({ userId })
      .select('sessionId messages lastInteraction')
      .sort({ lastInteraction: -1 })
      .limit(10); // Last 10 sessions

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
