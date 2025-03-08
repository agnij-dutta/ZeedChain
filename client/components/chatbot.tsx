import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function ChatbotModal() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question) return;
    setLoading(true);

    try {
      const response = await axios.post('/api/ai-advisor', { question });
      setAnswer(response.data.answer);
    } catch (error) {
      setAnswer('Failed to fetch answer. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Talk To Jordan</Button>
        </DialogTrigger>
        <DialogContent className="w-[400px]">
          <h2 className="text-xl font-bold mb-2">Chatbot</h2>
          <textarea
            className="w-full border p-2 rounded"
            rows="3"
            placeholder="Ask me anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button onClick={handleAskQuestion} disabled={loading} className="mt-2">
            {loading ? 'Getting Answer...' : 'Submit'}
          </Button>
          {answer && (
            <div className="mt-4 border p-2 rounded bg-black">
              <strong>Answer:</strong>
              <p>{answer}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
