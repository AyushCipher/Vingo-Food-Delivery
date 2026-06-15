# 🤖 Vingo Chatbot - Setup & Configuration Guide

## Overview
This guide will help you set up and configure the AI-powered chatbot that provides customer support for the Vingo food delivery and reels platform.

## Features
✅ **Hybrid AI System** - Combines rule-based responses with Google Gemini AI  
✅ **Floating Chat Widget** - Always-accessible support on the frontend  
✅ **Conversation History** - Persistent chat storage per session and user  
✅ **Multi-role Support** - Tailored responses for customers, shop owners, and delivery partners  
✅ **Real-time Responses** - Instant bot replies with typing indicators  

---

## Backend Setup

### 1. Install Required Dependencies

```bash
cd backend
npm install google-generative-ai
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Google Gemini API
GEMINI_API_KEY=AIzaSyDNmO7esJLceueVjG78jyYxG6MA4SINR8o

# Optional: Customize API endpoints
CHAT_API_URL=http://localhost:8000/api/chat
CHAT_HISTORY_LIMIT=10  # Number of messages to fetch
```

**Getting your Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key for your project
4. Copy and paste it into your `.env` file

### 3. Database Collections

The chatbot uses these collections:
- **ChatMessage** - Stores all chat sessions and message history

Auto-deletion: Old anonymous sessions are deleted after 7 days (configurable in the model)

### 4. API Endpoints

#### Send Message
```
POST /api/chat/message

Request Body:
{
  "sessionId": "session_123456789_abc123",
  "userId": "user_id_optional",
  "userMessage": "How do I track my order?",
  "userRole": "customer",  // 'customer' | 'owner' | 'deliveryBoy'
  "currentPage": "/my-orders"
}

Response:
{
  "success": true,
  "message": "To track your order...",
  "source": "rule-based",  // 'rule-based' | 'ai' | 'fallback'
  "sessionId": "session_123456789_abc123"
}
```

#### Get Chat History
```
GET /api/chat/history/:sessionId

Response:
{
  "success": true,
  "sessionId": "session_123456789_abc123",
  "messages": [
    {
      "role": "user",
      "content": "How do I track my order?",
      "timestamp": "2024-04-20T10:30:00Z"
    },
    {
      "role": "bot",
      "content": "To track your order...",
      "timestamp": "2024-04-20T10:30:05Z"
    }
  ],
  "lastInteraction": "2024-04-20T10:30:05Z"
}
```

#### Get User's Previous Sessions
```
GET /api/chat/sessions

Response:
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_123...",
      "messages": [...],
      "lastInteraction": "2024-04-20T10:30:00Z"
    }
  ]
}
```

#### Clear Chat History
```
DELETE /api/chat/history/:sessionId

Response:
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
VITE_API_URL=http://localhost:8000  # Backend API URL
```

For production:
```env
VITE_API_URL=https://vingo-backend-194r.onrender.com
```

### 3. Component Usage

The ChatWidget is already integrated in `App.jsx`. It will:
- ✅ Appear automatically for logged-in users
- ✅ Create a unique session ID per browser
- ✅ Store session ID in localStorage
- ✅ Display as a floating bubble in the bottom-right corner

### 4. Customization

#### Change Styling
Edit `ChatWidget.css` and `ChatInterface.css` to customize:
- Colors (currently using purple gradient #667eea to #764ba2)
- Position (bottom-right by default)
- Size (360px width × 500px height on desktop)
- Mobile breakpoints

#### Change Widget Position
In `ChatWidget.css`, modify:
```css
.chat-widget {
  bottom: 20px;  /* Distance from bottom */
  right: 20px;   /* Distance from right */
}
```

#### Change Quick Suggestions
Edit `ChatInterface.jsx`:
```jsx
<button
  className="quick-btn"
  onClick={() => setInputValue('Your custom question')}
>
  Button text
</button>
```

---

## Knowledge Base Configuration

### Adding New FAQ Responses

Edit `backend/config/knowledgeBase.js`:

```javascript
export const knowledgeBase = {
  yourCategory: {
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    response: `Your bot response here...`,
  },
  // ... other categories
};
```

**Example:**
```javascript
deliveryIssue: {
  keywords: ['delivery delayed', 'late delivery', 'delivery problem'],
  response: `I apologize for the delay. Here's what I can do:
1. Check your order status
2. Contact the delivery partner
3. Request a refund if needed`,
},
```

### How the Hybrid System Works

1. **Rule-based Match Found** → Returns FAQ response immediately ⚡
2. **No Rule Match** → Calls Google Gemini API for intelligent response 🤖
3. **Both Fail** → Returns fallback message with options

---

## Testing the Chatbot

### 1. Test Backend API

```bash
# Start backend server
npm start

# Test send message
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "userMessage": "How do I track my order?",
    "userRole": "customer"
  }'
```

### 2. Test Frontend

```bash
# Start frontend
npm run dev

# Visit http://localhost:5173
# Look for purple chat bubble in bottom-right corner
# Click to open and test the chat
```

### 3. Manual Testing Checklist

- [ ] Chat bubble appears on all pages
- [ ] Can send and receive messages
- [ ] Rule-based responses work (try: "track order", "payment failed")
- [ ] AI responses work for random questions
- [ ] Chat history persists on page reload
- [ ] Typing indicator shows while loading
- [ ] Mobile responsive design works
- [ ] Messages appear in the correct order

---

## Troubleshooting

### API Key Not Working
```
Error: 401 Unauthorized from Gemini API
```
**Solution:** 
- Verify API key is correct in `.env`
- Check API key is enabled in Google Cloud Console
- Regenerate a new API key if needed

### Messages Not Saving
```
Error: MongoDB connection failed
```
**Solution:**
- Check MongoDB connection string in `config/db.js`
- Ensure database is running
- Verify network connectivity

### Frontend Not Calling Backend
```
Error: CORS error when sending messages
```
**Solution:**
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in `backend/index.js`
- Ensure backend is running on the correct port

### Chat Widget Not Showing
```
The chat bubble doesn't appear
```
**Solution:**
- Ensure user is logged in (`userData` exists)
- Check console for JavaScript errors
- Verify `ChatWidget` is imported in `App.jsx`
- Check CSS is loading correctly

### Typing Indicator Infinite Loop
```
The typing indicator never stops
```
**Solution:**
- Check if API call is hanging
- Verify Gemini API quota hasn't been exceeded
- Check browser console for fetch errors

---

## Production Deployment

### Before Going Live

1. **Update Environment Variables**
   ```env
   # .env.production
   VITE_API_URL=https://your-production-api.com
   GEMINI_API_KEY=your_production_key
   ```

2. **Test on Production Build**
   ```bash
   npm run build
   npm run preview
   ```

3. **Monitor Chat Usage**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor Gemini API quota
   - Track conversation analytics

4. **Update Knowledge Base**
   - Add more FAQ categories based on user questions
   - Monitor bot performance metrics
   - Refine responses based on user feedback

### Scaling Considerations

- **High Traffic:** Add rate limiting to API endpoints
- **Long Conversations:** Implement pagination for old messages
- **Privacy:** Ensure GDPR/data protection compliance
- **Analytics:** Track which responses users find helpful

---

## API Rate Limits

- **Gemini API:** 60 requests per minute (free tier)
- **Chat API:** Implement your own rate limiting based on IP/user

---

## Future Enhancements

- 🔄 Integration with support tickets system
- 📊 Chat analytics dashboard
- 🎯 Bot training on actual customer conversations
- 🌍 Multi-language support
- 💳 Integration with payment system for refunds
- 📱 Native mobile app support

---

## Support

For issues or questions about the chatbot:

1. Check the troubleshooting section above
2. Review console errors in browser DevTools
3. Check backend logs for API errors
4. Contact the development team with error details

---

**Happy chatting! 🚀**
